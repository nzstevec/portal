from email.mime.text import MIMEText
import smtplib
from flask import Flask, request, Response, jsonify, send_from_directory
from flask_cors import CORS
from pydantic import ValidationError
import os
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