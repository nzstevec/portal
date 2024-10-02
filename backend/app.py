from email.mime.text import MIMEText
import smtplib
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pydantic import ValidationError
import os
import boto3
from datetime import datetime
import logging

from model.query import QueryRequest, QueryResponse
from config import Config, load_environment_variables
from authorizer import check_auth_token
from model.feedback import CreateFeedbackRequest, CreateFeedbackResponse
from service.smtp_client import SmtpClient

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)
load_environment_variables()
app = Flask(__name__, static_folder='../frontend/build')
app.config.from_object(Config)
CORS(app)
smtp_client = SmtpClient()
s3_client = boto3.client('s3', region_name=Config.AWS_REGION)

@check_auth_token
@app.route('/api/feedback', methods=['POST'])
def feedback(*args, **kw):
    # logger.info(f"/api/feedback called with headers {request.headers}")
    iso_string = datetime.now().isoformat()
    if "auth_error" in kw:
        print(f"Error: {kw['auth_error']}")
        # return Response(jsonify(message=kw["auth_error"]), status=401)
    try:
        logger.info(f"/api/feedback called with body: {request.json}")
        feedback = CreateFeedbackRequest(**request.json)
    except ValidationError as e:
        message = f"Invalid data: {repr(e.errors()[0]['type'])}"
        feedbackResponse = CreateFeedbackResponse(status='400', message=message, received=iso_string)
        logger.error(f"ValidationError: {feedbackResponse.model_dump_json()}")
        return jsonify(feedbackResponse.model_dump_json()), feedbackResponse.status
    
    # Prepare the email
    subject = f"New Feedback: {feedback.category}"
    body = f"Category: {feedback.category}\n\nFeedback:\n{feedback.feedback}"   
    logger.info(f"Sending feedback {subject}: {body}") 
    try:
        smtp_client.send_email(subject, body)
        feedbackResponse = CreateFeedbackResponse(status='200', message="Feedback sent successfully", received=iso_string)
        logger.info(f"Feedback sent successfully: {feedbackResponse.model_dump_json()}")
        return jsonify(feedbackResponse.model_dump_json()), feedbackResponse.status
    except Exception as e:
        message = f"Error sending email: {e}"
        feedbackResponse = CreateFeedbackResponse(status='500', message=message, received=iso_string)
        logger.error(f"Error sending email: {feedbackResponse.model_dump_json()}")
        return jsonify(feedbackResponse.model_dump_json()), feedbackResponse.status

@check_auth_token
@app.route('/api/get-presigned-url', methods=['POST'])
def get_presigned_url(*args, **kw):
    data = request.get_json()

    # Validate request data
    userid = data.get('userid')
    filename = data.get('filename')
    filetype = data.get('filetype')

    if not userid or not filename or not filetype:
        return jsonify({'message': 'Missing required fields.'}), 400

    # Generate a unique filename to prevent collisions
    unique_filename = f"{uuid.uuid4()}-{filename}"
    file_key = f"{userid}/{unique_filename}"

    try:
        # Generate presigned URL for PUT operation
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': Config.FILE_UPLOAD_BUCKET,
                'Key': file_key,
                'ContentType': filetype
            },
            ExpiresIn=3600  # URL expiration time in seconds
        )

        # Construct the file URL
        file_url = f"https://{Config.FILE_UPLOAD_BUCKET}.s3.{Config.AWS_REGION}.amazonaws.com/{file_key}"

        return jsonify({
            'presignedUrl': presigned_url,
            'fileUrl': file_url
        }), 200

    except Exception as e:
        app.logger.error(f"Error generating presigned URL: {e}")
        return jsonify({'message': 'Error generating presigned URL.'}), 500
    
@check_auth_token
@app.route('/api/ai-query', methods=['POST'])
def ai_query(*args, **kw):
    data = request.get_json()
    try:
        query_request = QueryRequest(**data)
    except ValidationError as e:
        return jsonify({'message': 'Invalid request data'}), 400  

    try:
        logger.info(f"AI Query: userid: {query_request.userid}, user_input: {query_request.user_input}, template_name: {query_request.template_name}, file_names: {query_request.file_names}")
        query_response = QueryResponse()
        query_response.received = datetime.now().isoformat()
        query_response.status = '200'
        query_response.ai_response = f"I dont know the answer to [{query_request.user_input}]"

        return query_response.model_dump_json(), 200

    except Exception as e:
        app.logger.error(f"Error generating ai query response: {e}")
        query_response = QueryResponse()
        query_response.received = datetime.now().isoformat()
        query_response.status = '500'
        query_response.ai_response = f"something went wrong: {e}"
        return query_response.model_dump_json(), 500
    

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
# @check_auth_token
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)