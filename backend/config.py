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
    # portal_alb_header: str
    # doc_analyst_runpod_pod_id: str
    # runpod_bearer_token: str
    # openai_api_key: str
    # cognito_pool_id: str
    # cognito_app_client_id: str
    # cognito_app_client_secret: str
    # hugging_face_hub_token: str
    # smtp_user: str
    # smtp_pw: str
    DOC_ANALYST_RUNPOD_POD_ID: str
    RUNPOD_BEARER_TOKEN: str
    OPENAI_API_KEY: str
    COGNITO_POOL_ID: str
    COGNITO_APP_CLIENT_ID: str
    COGNITO_APP_CLIENT_SECRET: str
    HUGGING_FACE_HUB_TOKEN: str
    SMTP_SERVER: str
    SMTP_PORT: int
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    SMTP_USE_TLS: bool
    DESTINATION_EMAIL: str
    SOURCE_EMAIL: str
    SECRET_KEY: str


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

    logger.info(f"Got secret {secret_name} with value {get_secret_value_response['SecretString']}")
    secret = get_secret_value_response['SecretString']
    json_obj = json.loads(secret)
    # convert keys to uppercase
    uppercase_json_obj = {k.upper(): v for k, v in json_obj.items()}

    return Secrets(**uppercase_json_obj)


def load_environment_variables() -> None:
    """
    Load the variables from the environment and then updated from secrets manager 
    Or if AWS_ENV is set to local, load from local .env file.
    """
    if "AWS_ENV" in os.environ:
        awsEnv = os.environ.get("AWS_ENV")
        logger.info(f"AWS_ENV is {awsEnv}")
        if awsEnv == "local":
            load_dotenv(override=True)
            logger.info(f"Loaded secrets from DOTENV for local environment")
            return

    if "PORTAL_SECRETS" in os.environ:
        secret_name = os.environ.get("PORTAL_SECRETS")
        logger.info(f"Loading secrets from {secret_name} in Secrets Manager")
        secrets = get_secrets(secret_name)
        logger.info(f"Loaded secrets from {secret_name} in Secrets Manager")

        os.environ['DOC_ANALYST_RUNPOD_POD_ID'] = secrets.DOC_ANALYST_RUNPOD_POD_ID
        os.environ['RUNPOD_BEARER_TOKEN'] = secrets.RUNPOD_BEARER_TOKEN
        os.environ['OPENAI_API_KEY'] = secrets.OPENAI_API_KEY
        os.environ['COGNITO_POOL_ID'] = secrets.COGNITO_POOL_ID
        os.environ['COGNITO_APP_CLIENT_ID'] = secrets.COGNITO_APP_CLIENT_ID
        os.environ['COGNITO_APP_CLIENT_SECRET'] = secrets.COGNITO_APP_CLIENT_SECRET
        os.environ['HUGGING_FACE_HUB_TOKEN'] = secrets.HUGGING_FACE_HUB_TOKEN
        os.environ['SMTP_SERVER'] = secrets.SMTP_SERVER
        os.environ['SMTP_PORT'] = secrets.SMTP_PORT
        os.environ['SMTP_USERNAME'] = secrets.SMTP_USERNAME
        os.environ['SMTP_PASSWORD'] = secrets.SMTP_PASSWORD
        os.environ['SMTP_USE_TLS'] = secrets.SMTP_USE_TLS
        os.environ['DESTINATION_EMAIL'] = secrets.DESTINATION_EMAIL
        os.environ['SOURCE_EMAIL'] = secrets.M
        os.environ['SECRET_KEY'] = secrets.SECRET_KEY

        logger.info("Loaded secrets from AWS Secrets Manager")
    else:
        logger.info("No secrets loaded from AWS Secrets Manager")

    return

@functools.lru_cache(maxsize=None)
def load_environment_variable(key: str, default: str = None) -> str:
    """
    Load the variables from the environment or secrets manager or .env file.
    """
    key = key.upper()
    value = os.environ.get(key)
    logger.info(f"Loading ENV VARIABLE {key} from OS ENVIRONMENT")
    if value is None:
        value = default
        logger.error(f"No ENV VARIABLE has been found for {key} so defaulting to {default}")
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
