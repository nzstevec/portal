import json
from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
from model.doc_audit import DocAuditRequest, DocAuditResponse
from pydantic import ValidationError
import os
from datetime import datetime
import logging

from service.doc_analyst import send_chat_message
from gpt.parsing import process_files
from service.doc_audit import send_audit_message
from service.s3_client import delete_uploaded_file, get_download_urls, get_file_like_object_from_s3, get_presigned_url, get_uploaded_filenames
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

@check_auth_token
@app.route('/api/feedback', methods=['POST'])
def feedback_route(*args, **kw):
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
@app.route('/api/presigned-url', methods=['POST'])
def get_presigned_url_route(*args, **kw):
    data = request.get_json()

    # Validate request data
    userid = data.get('userid')
    filename = data.get('filename')
    filetype = data.get('filetype')

    if not userid or not filename or not filetype:
        return jsonify({'message': 'Missing required fields.'}), 400

    try:
        # Generate presigned URL for PUT operation
        presigned_url, file_url = get_presigned_url(userid, filename, filetype)

        return jsonify({
            'presignedUrl': presigned_url,
            'fileUrl': file_url
        }), 200

    except Exception as e:
        app.logger.error(f"Error generating presigned URL: {e}")
        return jsonify({'message': 'Error generating presigned URL.'}), 500


@check_auth_token
@app.route('/api/uploaded-filenames/<string:userid>', methods=['GET'])
def uploaded_filenames_route(userid, *args, **kw):
    if not userid:
        return jsonify({'message': 'Missing required fields.'}), 400

    try:
        # Generate presigned URL for PUT operation
        filenames = get_uploaded_filenames(userid)

        return jsonify({
            'filenames': filenames
        }), 200

    except Exception as e:
        app.logger.error(f"Error getting uploaded filenames: {e}")
        return jsonify({'message': 'Error getting uploaded filenames.'}), 500


@check_auth_token
@app.route('/api/uploaded-files/<string:userid>/<string:filename>', methods=['DELETE'])
def delete_uploaded_file_route(userid, filename, *args, **kw):
    if not userid or not filename:
        return jsonify({'message': 'Missing required fields.'}), 400

    try:
        # Generate presigned URL for PUT operation
        delete_uploaded_file(userid, filename)

        return '', 204

    except Exception as e:
        app.logger.error(f"Error getting uploaded filenames: {e}")
        return jsonify({'message': 'Error getting uploaded filenames.'}), 500


@check_auth_token
@app.route('/api/ai-doc-audit', methods=['GET'])
def ai_doc_audit_route(*args, **kw):
    data = json.loads(request.args.get("payload"))
    try:
        doc_audit_request = DocAuditRequest(**data)
        logger.info(f"--> doc_audit_request: {doc_audit_request}")
    except ValidationError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({'message': 'Invalid request data', 'details': str(e)}), 400
    except Exception as e:
        logger.error(f"Unexpected error during request parsing: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500

    def generate():
        with app.app_context():
            try:
                logger.info(f"AI Doc Audit: userid: {doc_audit_request.userid}, file_name: {doc_audit_request.file_name}, template_name: {doc_audit_request.template_name}, style_guide_file_names: {doc_audit_request.style_guide_file_names}")
                download_urls, file_keys = get_download_urls(doc_audit_request.userid, doc_audit_request.file_name)
                uploaded_files = []
                for download_url, file_key in zip(download_urls, file_keys):
                    try:
                        logger.info(f"Fetching from URL: {download_url}")
                        file_like_object = get_file_like_object_from_s3(download_url)
                        file_like_object.name = file_key
                        uploaded_files.append(file_like_object)
                    except Exception as e:
                        logger.error(f"Failed to fetch or process the file at {download_url}: {str(e)}")
                        continue

                logger.debug(f"First 50 chars of first 5 file contents: {[f.read(50) for f in uploaded_files[:5]]}") 
                file_contents, rimon_template_contents, total_tokens = process_files(uploaded_files)
                logger.info(f"Total tokens: {total_tokens}")

                if total_tokens > 60000:
                    logger.warning(f"Total tokens exceed 60000, likely failure ahead. Total tokens: {total_tokens}")  

                doc_audit_response = DocAuditResponse(
                    status='100',
                    ai_response=f"{doc_audit_request.ai_provider} starting"
                )
                doc_audit_response_dict = doc_audit_response.model_dump()
                # print(f"doc_audit_response_dict: {doc_audit_response_dict}")  
                yield "event: message\n"
                yield f"data: {json.dumps(doc_audit_response_dict)}\n\n"

                response = send_audit_message(
                    style_guides_filter=doc_audit_request.style_guide_file_names, 
                    additional_context=file_contents,
                    ai_provider=doc_audit_request.ai_provider)
                for interim_result in response:
                    doc_audit_response = DocAuditResponse(
                        status='200',
                        ai_response=interim_result
                    )
                    doc_audit_response_dict = doc_audit_response.model_dump()
                    # print(f"doc_audit_response_dict: {doc_audit_response_dict}")  
                    yield "event: message\n"
                    yield f"data: {json.dumps(doc_audit_response_dict)}\n\n"

            except Exception as e:
                logger.error(f"Error processing request: {e}")
                query_response = QueryResponse(
                    status = '500',
                    ai_response = f"Internal server error: {e}"
                )
                doc_audit_response_dict = query_response.model_dump()
                yield "event: error\n"
                yield f"data: {json.dumps(doc_audit_response_dict)}\n\n"

    return Response(generate(), mimetype="text/event-stream")

# def ai_doc_audit_route(*args, **kw):
#     data = request.get_json()
#     try:
#         doc_audit_request = DocAuditRequest(**data)
#         logger.info(f"doc_audit_request: {doc_audit_request}")
#     except ValidationError as e:
#         logger.error(f"Validation error: {str(e)}")
#         return jsonify({'message': 'Invalid request data', 'details': str(e)}), 400
#     except Exception as e:
#         logger.error(f"Unexpected error during request parsing: {str(e)}")
#         return jsonify({'message': 'Internal server error'}), 500

#     try:
#         logger.info(f"AI Doc Audit: userid: {doc_audit_request.userid}, file_name: {doc_audit_request.file_name}, template_name: {doc_audit_request.template_name}, style_guide_file_names: {doc_audit_request.style_guide_file_names}")
#         download_urls, file_keys = get_download_urls(doc_audit_request.userid, doc_audit_request.file_name)
#         uploaded_files = []
#         for download_url, file_key in zip(download_urls, file_keys):
#             try:
#                 logger.info(f"Fetching from URL: {download_url}")
#                 file_like_object = get_file_like_object_from_s3(download_url)
#                 file_like_object.name = file_key
#                 uploaded_files.append(file_like_object)
#             except Exception as e:
#                 logger.error(f"Failed to fetch or process the file at {download_url}: {str(e)}")
#                 continue

#         logger.debug(f"First 50 chars of first 5 file contents: {[f.read(50) for f in uploaded_files[:5]]}") 
#         file_contents, rimon_template_contents, total_tokens = process_files(uploaded_files)
#         logger.info(f"Total tokens: {total_tokens}")

#         if total_tokens > 60000:
#             logger.warning(f"Total tokens exceed 60000, likely failure ahead. Total tokens: {total_tokens}")  

#         response = send_audit_message(
#             style_guides_filter=doc_audit_request.style_guide_file_names, 
#             additional_context=file_contents)
#         logger.info("after automated 'review my doc' AI call")
#         logger.info(f"Received AI response: {response}")

#         doc_audit_response = DocAuditResponse(
#             status='200',
#             ai_response=response
#         )
#         doc_audit_response_dict = doc_audit_response.model_dump()
#         logger.info(f"Returning AI response: {doc_audit_response_dict}")
#         return Response(doc_audit_response_dict, mimetype='text/event-stream',status=200)

#     except Exception as e:
#         app.logger.error(f"Error generating ai query response: {e}")
#         query_response = QueryResponse(
#             status = '500',
#             ai_response = f"Internal server error: {e}"
#         )
#         doc_audit_response_dict = query_response.model_dump()
#         return jsonify(doc_audit_response_dict), 500

@check_auth_token
@app.route('/api/ai-query', methods=['POST'])
def ai_query_route(*args, **kw):
    data = request.get_json()
    try:
        query_request = QueryRequest(**data)
    except ValidationError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({'message': 'Invalid request data', 'details': str(e)}), 400
    except Exception as e:
        logger.error(f"Unexpected error during request parsing: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500

    try:
        logger.info(f"AI Query: userid: {query_request.userid}, user_input: {query_request.user_input}, template_name: {query_request.template_name}, file_names: {query_request.file_names}")
        download_urls, file_keys = get_download_urls(query_request.userid, query_request.file_names)
        uploaded_files = []
        for download_url, file_key in zip(download_urls, file_keys):
            try:
                logger.info(f"Fetching from URL: {download_url}")
                file_like_object = get_file_like_object_from_s3(download_url)
                file_like_object.name = file_key
                uploaded_files.append(file_like_object)
            except Exception as e:
                logger.error(f"Failed to fetch or process the file at {download_url}: {str(e)}")
                continue

        logger.debug(f"First 50 chars of first 5 file contents: {[f.read(50) for f in uploaded_files[:5]]}") 
        file_contents, rimon_template_contents, total_tokens = process_files(uploaded_files)
        logger.info(f"Total tokens: {total_tokens}")

        if total_tokens > 60000:
            logger.warning(f"Total tokens exceed 60000, likely failure ahead. Total tokens: {total_tokens}")  

        messages = [{"role": "user", "content": query_request.user_input}]
        logger.info(f"Sending AI Query: {messages}")
        response = send_chat_message(messages, "nothing uploaded", file_contents)
        logger.info(f"Received AI response: {response}")

        query_response = QueryResponse(
            # received=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            status='200',
            ai_response=response
        )
        query_response_dict = query_response.model_dump()
        logger.info(f"Returning AI response: {query_response_dict}")
        return jsonify(query_response_dict), 200

    except Exception as e:
        app.logger.error(f"Error generating ai query response: {e}")
        query_response = QueryResponse(
            # received = datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            status = '500',
            ai_response = f"Internal server error: {e}"
        )
        query_response_dict = query_response.model_dump()
        return jsonify(query_response_dict), 500
    

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