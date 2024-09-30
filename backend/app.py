from email.mime.text import MIMEText
import smtplib
import uuid
# from aiohttp import ClientError
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pydantic import ValidationError
import os
import boto3
from datetime import datetime
import logging

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

@app.route('/api/feedback', methods=['POST'])
@check_auth_token
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


@app.route('/api/get-presigned-url', methods=['POST'])
# @check_auth_token
def get_presigned_url():
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
                'ContentType': filetype,
                'ACL': 'public-read'  # Adjust based on your requirements
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