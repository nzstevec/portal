import os
import functools
import json
import logging
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from pydantic import BaseModel


logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


class Secrets(BaseModel):
    portal_alb_header: str
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
def load_environment_variable(key: str, default: str = None) -> str:
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
        value = default
        logger.error(f"No ENV VARIABLE has been loaded for {key} so defaulting to {default}")

    return value


runpod_credentials_chat = {
    "runpod_pod_id": load_environment_variable("doc_analyst_runpod_pod_id"),
    "runpod_bearer_token": load_environment_variable("runpod_bearer_token"),
}


class Config:
    # SMTP Configuration
    SMTP_SERVER = load_environment_variable('SMTP_SERVER', 'smtp.example.com') # os.getenv('SMTP_SERVER', 'smtp.example.com')
    SMTP_PORT = int(load_environment_variable('SMTP_PORT', 587)) # int(os.getenv('SMTP_PORT', 587))
    SMTP_USERNAME = load_environment_variable('SMTP_USERNAME', 'user@example.com') # os.getenv('SMTP_USERNAME', 'user@example.com')
    SMTP_PASSWORD = load_environment_variable('SMTP_PASSWORD', 'password') # os.getenv('SMTP_PASSWORD', 'password')
    SMTP_USE_TLS = load_environment_variable('SMTP_USE_TLS', 'True') # os.getenv('SMTP_USE_TLS', 'True') == 'True'
    
    # Destination Email
    DESTINATION_EMAIL = load_environment_variable('DESTINATION_EMAIL', 'feedback@example.com') # os.getenv('DESTINATION_EMAIL', 'feedback@example.com')
    SOURCE_EMAIL = load_environment_variable('SOURCE_EMAIL', 'user@example.com') # os.getenv('SOURCE_EMAIL', 'user@example.com')
    
    # Flask Configuration
    SECRET_KEY = load_environment_variable('SECRET_KEY', 'your_secret_key') # os.getenv('SECRET_KEY', 'your_secret_key')
    PORT = load_environment_variable('PORT', 8080) # int(os.getenv('PORT', 8080)) # 8080
