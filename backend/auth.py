# import streamlit as st
import jwt
# from streamlit_cognito_auth import CognitoAuthenticator
from utils import load_environment_variable

def get_id_token(headers):
 
    # for key, value in headers.items():
    #     print(f"Header.{key}: {value}")
    if not headers or "X-Amzn-Oidc-Data" not in headers:
        return {}
    token = jwt.decode(
        headers["X-Amzn-Oidc-Data"], algorithms=["ES256"], options={"verify_signature": False}
    )
    # for key, value in token.items():
    #     print(f"token.{key}: {value}")
    return token


def get_access_token(headers):
    # for key, value in headers.items():
    #     print(f"Header.{key}: {value}")
    if not headers or "X-Amzn-Oidc-Accesstoken" not in headers:
        return {}
    token = jwt.decode(
        headers["X-Amzn-Oidc-Accesstoken"], 
        algorithms=["ES256"], 
        options={"verify_signature": False}
    )
    # for key, value in token.items():
    #     print(f"token.{key}: {value}")
    return token


def get_user_details(headers):
    if is_local:
        return {
            "username": "SteveLocal",
            "given_name": "Steve",
            "family_name": "Chapman",
            "email": "steve.g.chapman@gmail.com"
            }, "portal-high-security, portal-general-security"

    id_token = get_id_token(headers)
    access_token = get_access_token(headers)
    if "cognito:groups" in access_token:
        roles = ", ".join(access_token["cognito:groups"])
    else:
        roles = ""
    return id_token, roles


is_local = load_environment_variable("AWS_ENV") == "local"
