# utility function for api interactions
import functools
import json
import logging
import os
from typing import Tuple
from dotenv import load_dotenv
import boto3
from botocore.exceptions import ClientError
from openai import OpenAI
from pydantic import BaseModel
import smtplib
from email.mime.text import MIMEText

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


class Secrets(BaseModel):
    portal_alb_header: str
    # runpod_pod_id: str
    doc_analyst_runpod_pod_id: str
    runpod_bearer_token: str
    openai_api_key: str
    cognito_pool_id: str
    cognito_app_client_id: str
    cognito_app_client_secret: str
    hugging_face_hub_token: str
    smtp_user: str
    smtp_pw: str


def get_secrets(secret_name: str) -> Secrets:
    """
    Get secrets from the Secrets Manager and return a Secrets object.

    Returns:
        Secrets: A data class containing various secret values.
    """
    region_name = "ap-southeast-2"

    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name)
    except ClientError as e:
        logger.error("Couldn't get secret %s. Here's why: %s",
                     secret_name, e.response['Error']['Code'])
        raise e

    secret = get_secret_value_response['SecretString']
    return Secrets(**json.loads(secret))


@functools.lru_cache(maxsize=None)
def load_environment_variable(key: str) -> str:
    """
    Load the variable from the environment or secrets manager.
    """
    key = key.upper()
    useOsEnv = False
    if "AWS_ENV" in os.environ:
        awsEnv = os.environ.get("AWS_ENV")
        logger.info(f"AWS_ENV is {awsEnv}")

    if "PORTAL_SECRETS" in os.environ:
        secret_name = os.environ.get("PORTAL_SECRETS")
        secrets = get_secrets(secret_name)
        os.environ['PORTAL_ALB_HEADER'] = secrets.portal_alb_header
        # os.environ['RUNPOD_POD_ID'] = secrets.runpod_pod_id
        os.environ['DOC_ANALYST_RUNPOD_POD_ID'] = secrets.doc_analyst_runpod_pod_id
        os.environ['RUNPOD_BEARER_TOKEN'] = secrets.runpod_bearer_token
        os.environ['OPENAI_API_KEY'] = secrets.openai_api_key
        # the following are no longer needed
        os.environ['COGNITO_POOL_ID'] = secrets.cognito_pool_id
        os.environ['COGNITO_APP_CLIENT_ID'] = secrets.cognito_app_client_id
        os.environ['COGNITO_APP_CLIENT_SECRET'] = secrets.cognito_app_client_secret
        os.environ['HUGGING_FACE_HUB_TOKEN'] = secrets.hugging_face_hub_token
        os.environ['SMTP_USER'] = secrets.smtp_user
        os.environ['SMTP_PW'] = secrets.smtp_pw

        logger.info("Loaded secrets from AWS Secrets Manager")
        useOsEnv = True
    else:
        logger.info("No secrets loaded from AWS Secrets Manager")

    if useOsEnv:
        value = os.environ.get(key)
        logger.info(f"Loading ENV VARIABLE {key} from OS ENVIRONMENT")
    else:
        load_dotenv(override=True)
        value = os.environ.get(key)
        logger.info(f"Loading ENV VARIABLE {key} from DOTENV")

    if value is None:
        logger.error(f"No ENV VARIABLE has been loaded for {key}")

    return value


runpod_credentials_chat = {
    "runpod_pod_id": load_environment_variable("doc_analyst_runpod_pod_id"),
    "runpod_bearer_token": load_environment_variable("runpod_bearer_token"),
}


def invoke_openai_directly(query):

    client = OpenAI(
        # This is the default and can be omitted
        api_key=load_environment_variable("OPENAI_API_KEY"),
    )

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": query,
            }
        ],
        model="gpt-4o",
    )

    return chat_completion.choices[0].message.content


def invoke_openai_directly_with_messages(messages):

    client = OpenAI(
        # This is the default and can be omitted
        api_key=load_environment_variable("OPENAI_API_KEY"),
    )

    chat_completion = client.chat.completions.create(
        messages=messages,
        model="gpt-4o-mini",
    )

    return chat_completion.choices[0].message.content

def send_email(subject, message, from_addr, to_addr):
    smtp_user = load_environment_variable("SMTP_USER") 
    smtp_pw =  load_environment_variable("SMTP_PW") 
    msg = MIMEText(message)
    msg['Subject'] = subject
    msg['From'] = from_addr
    msg['To'] = to_addr

    server = smtplib.SMTP('email-smtp.ap-southeast-2.amazonaws.com', 587, local_hostname="portal.scoti.au")
    ehlo_result = server.ehlo()
    logger.info("Ehlo result: %s", ehlo_result)
    starttls_result = server.starttls()
    logger.info("StartTLS result: %s", starttls_result)
    login_result = server.login(smtp_user, smtp_pw)
    logger.info("Logged in to SMTP server, status: %s", login_result)
    send_result = server.sendmail(from_addr, to_addr, msg.as_string())
    logger.info("Sent email, status: %s", send_result)
    server.quit()
    logger.info("Email sent successfully")


if "__main__" == __name__:
    print("test email sending")
    send_email(
        subject="Scoti Portal Feedback",
        message="""
User: Steve Chapman

Email: stevec@aeq.services

Category: Comment

Feedback: \nLooks good to me""",
        from_addr="noreply@scoti.au",
        to_addr="stevec@aeq.services"
    )
