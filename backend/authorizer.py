import json
import os
import traceback
import logging

import boto3
import jwt
from jwt import PyJWKClient
from cachetools import TTLCache
from flask import Flask, request


logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

REGION = "ap-southeast-2"
USERPOOLID = "ap-southeast-2_7SEHafDKv"
AZURE_JWK_URL = "https://login.windows.net/common/discovery/keys"
AWS_COGNITO_JWK_URL = f"https://cognito-idp.{REGION}.amazonaws.com/{USERPOOLID}/.well-known/jwks.json"
validation = True

class CachingJWKClient(PyJWKClient):

    def __init__(self, uri: str):
        super().__init__(uri)
        self.cache = TTLCache(maxsize=10, ttl=3600)
        
    def is_token_in_cache(self, token: str):
        # the cache will automatically evict tokens after 1 hour
        # should probably check the token expiry and evict it from the cache if it's expired
        return token in self.cache
    
    def put_token_in_cache(self, token: str):
        self.cache[token] = None

jwt_client = CachingJWKClient(AWS_COGNITO_JWK_URL)


def get_jwt_signing_key(token: str):
    return jwt_client.get_signing_key_from_jwt(token)

HEADER_AUTH_TOKEN = 'X-Amzn-Oidc-Data' 
HEADER_ACCESS_TOKEN = 'X-Amzn-Oidc-Accesstoken' 
AUTH_ERROR = 'auth_error'

def check_auth_token(f):
    def wrapper(*args, **kw):
        try:
            logger.info(f"Checking auth token")
            headers = request.headers
            # logger.info(f"Headers: {headers}")
            if HEADER_AUTH_TOKEN not in headers and HEADER_ACCESS_TOKEN not in headers:
                logger.error(f"No token provided")
                kw[AUTH_ERROR] = "No token provided"
                return f(*args, **kw)
            if HEADER_AUTH_TOKEN in headers:
                # logger.info(f"Token[X-Amzn-Oidc-Data]: {headers[HEADER_AUTH_TOKEN]}")
                token = headers[HEADER_AUTH_TOKEN].replace("Bearer ", "")
                jwt_data = jwt.decode(token, options={"verify_signature": False})
                username = jwt_data.get("username")
                given_name = jwt_data.get("given_name")
                family_name = jwt_data.get("family_name")
                email = jwt_data.get("email")
                logger.info(f"idtoken - username: {username}, given_name: {given_name}, family_name: {family_name}, email: {email}")
            if HEADER_ACCESS_TOKEN in headers:
                # logger.info(f"Token[X-Amzn-Oidc-Accesstoken]: {headers[HEADER_ACCESS_TOKEN]}")
                token = headers[HEADER_ACCESS_TOKEN].replace("Bearer ", "")
                jwt_data = jwt.decode(token, options={"verify_signature": False})
                cognito_groups = jwt_data.get("cognito:groups", [])
                roles = ", ".join(cognito_groups)
                logger.info(f"accesstoken - roles: {roles}")
            kw.update({
                "username": username,
                "given_name": given_name,
                "family_name": family_name,
                "email": email,
                "roles": roles
            })
        except Exception as e:
            logger.error(f"Error checking auth token: {traceback.format_exc()}")
            kw[AUTH_ERROR] = e
        return f(*args, **kw)

    return wrapper


if __name__ == '__main__':
    @check_auth_token
    def f(request, context, **kwargs):
        if 'auth_error' in kwargs:
            return kwargs['auth_error']
        else:
            return 'all good with token'


    validation = True
    os.environ['JWT_AUDIENCE'] = "api://c967720f-3c85-4f59-8908-bf9377bfa017"
    token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiJhcGk6Ly84Y2EwNDZiNS1kYTY2LTQ5MjUtYWY2YS05Y2JhNWY3YmE2MTciLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82YmEzMDRhNi01MjBhLTRjZGQtYWZiZS01YTQxOTE5ZWQzOGEvIiwiaWF0IjoxNjg2MTc3NzE0LCJuYmYiOjE2ODYxNzc3MTQsImV4cCI6MTY4NjE4MTYxNCwiYWlvIjoiRTJaZ1lIaHkrT0VMRjVYN1M0S2ZOMGcvTklteUFBQT0iLCJhcHBpZCI6ImYyZTNlZDg5LWI4ZGQtNDFiZC1iN2I2LTA2YTAwNjM0ZGVkZCIsImFwcGlkYWNyIjoiMSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzZiYTMwNGE2LTUyMGEtNGNkZC1hZmJlLTVhNDE5MTllZDM4YS8iLCJvaWQiOiJkNmJlZDEwOS01Y2E3LTQ1NTgtOGFjNy00YzdiNmI4ZTMyOTAiLCJyaCI6IjAuQVdjQXBnU2phd3BTM1V5dnZscEJrWjdUaXJWR29JeG0yaVZKcjJxY3VsOTdwaGRuQUFBLiIsInJvbGVzIjpbIlJlYWRXcml0ZSJdLCJzdWIiOiJkNmJlZDEwOS01Y2E3LTQ1NTgtOGFjNy00YzdiNmI4ZTMyOTAiLCJ0aWQiOiI2YmEzMDRhNi01MjBhLTRjZGQtYWZiZS01YTQxOTE5ZWQzOGEiLCJ1dGkiOiJOcEQwemNXX0pVbUNWNm1TNmw4REFBIiwidmVyIjoiMS4wIn0.S4XHJItOnAsNv-wTc4uaq-YHqNr4sHBwQZXP7zYUKlX1Cjx26wN6_Z6ivF2gLmM5DHyk_767xyxRmNHFRyzfHlwMpLWyt1HmmJACiZnXvSbSbHUqsaJ6lJZexh4VvykIKEgRZhVVuAnO4GGeT9R9uxhNErTO3mzNbJk_dZirOs_QHnUnb5GFuk0-wx05bG6-gt7YSdu3CdLB15pxSXVYNwVB_UAy4kuQ7Ao9BhHFZuissa_v7XvYzuJh6aMIIDNyRWxIT1yQ1fXIYtEHp29TxaFLoQS8f5ndxQHRFqmaDJvNLV8l2lSAKh52DIj7szQUjkEmY5JDRQ6Ul9IGYIk8CA"
    request = {'headers': {'x-auth-token': f"Bearer {token}"}}
    value = f(request, None)
    print(value)
    value = f(request, None)
    print(value)
