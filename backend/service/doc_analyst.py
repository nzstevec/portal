from datetime import datetime
from gpt.parsing import process_files
from gpt.prompts import CHAT_PROMPT_WITH_FILES, CHAT_PROMPT_WITHOUT
from service.runpod_utils import runpod_call
from service.openai_client import invoke_openai_directly_with_messages
from config import runpod_credentials_chat, logger

def send_chat_message(messages, rdti_template, additional_context):
    if messages:
        include_files = bool(additional_context)
        if include_files:
            messages = [{
                "role": msg["role"],
                "content": CHAT_PROMPT_WITH_FILES.replace("<user-input>", msg["content"])
                } if msg["role"] == "user" 
                else {
                    "role": msg["role"], 
                    "content": msg["content"]
                } for msg in messages]
            messages[-1]["content"] = messages[-1]["content"].replace(
                "<rdti-template>", rdti_template).replace("<additional-context>", additional_context)
        else:
            messages = [{"role": msg["role"],
                        "content": CHAT_PROMPT_WITHOUT.replace("<user-input>", msg["content"])} if msg["role"] == "user" else {"role": msg["role"], "content": msg["content"]} for msg in messages]
        messages.pop(0)
        while len(str(messages)) > 240000:
            messages.pop(0)
        start = datetime.now()
        try:
            runpod_response = runpod_call(messages=messages, **runpod_credentials_chat)
        except TimeoutError:
            logger.error("Timeout error calling runpod")
            runpod_response = "Argh!!! I took too long to respond. please try again"
        except Exception as e:
            logger.error("Houston, we have a %s major problem", exc_info=True)
            runpod_response = "#@!# oops, something went wrong, please try again"
        end = datetime.now()
        logger.info(f"Got a {len(runpod_response)} character response. Call took {end-start}")
        return runpod_response