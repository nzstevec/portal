"""
Functions for making runpod calls, and getting the GPT response 
"""

import runpod
from config import load_environment_variable, logger
from openai_client import invoke_openai_directly

def runpod_sync_call(name, query):
    runpod.api_key = load_environment_variable("runpod_bearer_token")

    endpoint = runpod.Endpoint(load_environment_variable("runpod_pod_id"))

    try:
        run_request = endpoint.run_sync(
            {
                "input": {
                    "name": name,
                    "query": query
                }
            },
            timeout=60,  # Timeout in seconds.
        )

        return(run_request)
    except TimeoutError:
        logger.error("Runpod request timed out.")
    except Exception as e:
        logger.error("Houston, we have a %s", "major problem", exc_info=True)
    return invoke_openai_directly(query)

def runpod_call(prompt: str = "", messages: list = [], timeout: int = 180, **runpod_credentials):
    """
    Takes your input prompt, and gets output from the designated model

    Inputs:
        prompt (str): input message for GPT
        runpod_pod_id (str): pod id of the runpod pod you want to make a request to.
        runpod_bearer_token (str): your runpod bearer token
    """
    runpod_bearer_token = runpod_credentials.get("runpod_bearer_token")
    runpod_pod_id = runpod_credentials.get("runpod_pod_id")

    runpod.api_key = runpod_bearer_token
    endpoint = runpod.Endpoint(runpod_pod_id)
    if not messages:
        messages = [
                {"role": "user", "content": prompt},
            ]
    data = {
        "input": {
            "messages": messages,
            "max_tokens": 4096,
            "temperature": 0.001,
            "repetition_penalty": 1.00,
            "add_bos_token": False,
            "use_lora": False,
            # "prompt": prompt,
        }
    }
    print(f"calling runpod endpoint with data: {data}")
    run_request = endpoint.run(data)
    runpod_response = run_request.output(timeout=timeout)
    try:
        print(f"runpod request output: {runpod_response}")
        return ''.join(runpod_response)
    except Exception as e:
        logger.error("Houston, we have a %s", "major problem handling runpod output", exc_info=True)
        return ""


def runpod_call_stream(prompt: str, **runpod_credentials):
    """
    Takes your input prompt, and gets output from the designated model

    Inputs:
        prompt (str): input message for GPT

        runpod_credentials: like
        {
            runpod_pod_id_stream (str): pod id of the runpod pod you want to make a stream request to.
            runpod_bearer_token (str): your runpod bearer token
        }

    """
    runpod_bearer_token = runpod_credentials.get("runpod_bearer_token")
    runpod_pod_id = runpod_credentials.get("runpod_pod_id_stream")

    runpod.api_key = runpod_bearer_token
    endpoint = runpod.Endpoint(runpod_pod_id)
    endpoint.purge_queue()

    data = {
        "input": {
            "messages": [
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 4096,
            "temperature": 0.001,
            "repetition_penalty": 1.00,
            "add_bos_token": False,
            "use_lora": False,
            # "prompt": prompt,
        }
    }

    run_request = endpoint.run(data)
    for chars in run_request.stream():
        yield chars


if __name__ == "__main__":
    runpod_pod_id = ""
    runpod_api_key = ""

    runpod_credentials = {
        "runpod_pod_id": runpod_pod_id,
        "api_key": runpod_api_key,
    }
