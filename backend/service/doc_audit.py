from datetime import datetime
from gpt.parsing import DocumentParser, process_files
from gpt.prompts import CHAT_PROMPT_WITH_FILES, CHAT_PROMPT_WITHOUT, DOC_AUDIT_PROMPT_WITH_FILES
from service.runpod_utils import runpod_call
from service.openai_client import invoke_openai_directly_with_messages
from config import runpod_credentials_chat, logger

all_style_guides = [
    "accessible-and-inclusive-content_1",
    "accessible-and-inclusive-content_2",
    "referencing-and-attribution_1",
    "referencing-and-attribution_2",
    "referencing-and-attribution_3",
    "structuring-content_1",
    "structuring-content_2",
    "writing-and-designing-content_1",
    "writing-and-designing-content_2",
    "grammar-punctuation-and-conventions_1",
    "grammar-punctuation-and-conventions_2",
    "grammar-punctuation-and-conventions_3",
    "grammar-punctuation-and-conventions_4",
    "grammar-punctuation-and-conventions_5",
]


def get_style_guides(style_guides_filter):
    if style_guides_filter is None or len(style_guides_filter) == 0:
        style_guides_filter = all_style_guides
    style_guide_names = [
        "data/input/" + style_guide + ".pdf"
        for style_guide in style_guides_filter
    ]
    logger.info("style guides: %s", style_guide_names)
    parser = DocumentParser()
    style_guides = [parser.load_pdf(file_path=file_path) for file_path in style_guide_names]


# def send_chat_message(messages,previous_recommendations,additional_context,message_history,**runpod_credentials):
#     st.session_state.session_history += "\n\nUser : " + messages[-1]["content"] + "\n\n"
#     if "cancel" in st.session_state:
#         del st.session_state.cancel
#         return
#     logger.info("Sending message to SCOTi with previous recommendations")
#     if messages:
#         include_files = bool(additional_context)
#         if include_files:
#             logger.info(f"Including file in the prompt {additional_context[:200]}")
#             messages = [
#                 (
#                     {
#                         "role": msg["role"],
#                         "avatar": USER_AVATAR,
#                         "user-input": msg["content"],
#                         "content": DOC_AUDIT_CHAT_PROMPT_WITH_FILES.replace(
#                             "<user-input>", msg["content"]
#                         ),
#                     }
#                     if msg["role"] == "user"
#                     else {
#                         "role": msg["role"],
#                         "avatar": SCOTI_AVATAR,
#                         "content": msg["content"],
#                     }
#                 )
#                 for msg in messages
#             ]
#             messages[-1]["content"] = (
#                 messages[-1]["content"]
#                 .replace("<previous-recommendations>", previous_recommendations)
#                 .replace("<additional-context>", additional_context)
#             )
#         else:
#             logger.error("No additional context provided")
#         while len(messages) > 2:
#             messages.pop(0)
#         logger.info("Message length: %s", len(str(messages)))
#         while len(str(messages)) > 240000:
#             logger.info("oops - that message is too big, dropping the message: %s", len(str(messages)))
#             messages.pop(0)
#         start = datetime.now()
#         try:
#             if st.session_state.ai_provider == "SCOTi":
#                 runpod_response = runpod_call(messages=messages, **runpod_credentials)
#             else:
#                 runpod_response = invoke_openai_directly_with_messages(messages)
#         except TimeoutError as e:
#             logger.error("Timeout error calling runpod")
#             st.error(f"SCOTi is taking too long to respond. Please try again later.")
#             runpod_response = "Argh!!! I took too long to respond. please try again"
#         except Exception as e:
#             logger.error("Houston, we have a %s", "major problem", exc_info=True)
#             st.error(f"An error occurred in SCOTi: {e}")
#             runpod_response = "#@!# oops, something went wrong, please try again"
#         end = datetime.now()
#         logger.info(f"Got a {len(runpod_response)} character response. Call took {end-start}")
#         st.session_state.session_history += "\n\nSCOTi : " + runpod_response + "\n\n"
#         messages.append(
#             {
#                 "role": "assistant",
#                 "content": runpod_response,
#                 "avatar": SCOTI_AVATAR,
#             }
#         )
#         st.session_state.messages = [
#             {
#                 "role": msg["role"],
#                 "content": (
#                     msg["content"]
#                     if msg["role"] == "assistant"
#                     else msg.get("user-input", msg["content"])
#                 ),
#                 "avatar": msg.get("avatar", SCOTI_AVATAR),
#             }
#             for msg in messages
#         ]
#         # message_history.chat_message("assistant", avatar=SCOTI_AVATAR).write(
#         #     "Final response received: " + runpod_response
#         # )
#         st.session_state.download_history_disabled = False
#         st.session_state.enable_chat_input = True
#         return runpod_response


def send_audit_message(style_guides_filter, additional_context):
    style_guides = get_style_guides(style_guides_filter)
    messages = []
    for i, style_guide in enumerate(style_guides, start=1):
        ask_for_review = f"Please review my doc against style guide section [{i} of {len(style_guides)}] {style_guides_filter[i-1]}"
        messages.append({"role": "user","content": ask_for_review,})
        logger.info(f"Sending message to SCOTi with style guide {i} {style_guide.split(maxsplit=1)[0]}")
        messages = [
            (
                {
                    "role": msg["role"],
                    "user-input": msg["content"],
                    "content": DOC_AUDIT_PROMPT_WITH_FILES.replace(
                        "<user-input>", msg["content"]
                    ),
                } if msg["role"] == "user"
                else {
                    "role": msg["role"],
                    "content": msg["content"],
                }
            )
            for msg in messages
        ]
        messages[-1]["content"] = (
            messages[-1]["content"]
            .replace("<rdti-template>", style_guide)
            .replace("<additional-context>", additional_context)
        )

        while len(messages) > 2:
            messages.pop(0)
        logger.info("Message length: %s", len(str(messages)))
        while len(str(messages)) > 240000:
            logger.info("oops - that message is too big, dropping the message: %s",len(str(messages)),)
            messages.pop(0)
        start = datetime.now()
        try:
            runpod_response = runpod_call(messages=messages, **runpod_credentials_chat)
        except TimeoutError as e:
            logger.error("Timeout error calling runpod")
            runpod_response = "Argh!!! I took too long to respond. please try again"
        except Exception as e:
            logger.error("Houston, we have a %s", "major problem", exc_info=True)
            runpod_response = "#@!# oops, something went wrong, please try again"
        end = datetime.now()
        logger.info(f"Got a {len(runpod_response)} character response. Call took {end-start}")
        if i < len(style_guides):
            logger.info("after interim AI call")
            logger.info("AI response added to state")
            messages.append(
                {
                    "role": "assistant",
                    "content": runpod_response,
                }
            )
            logger.info(f"index is {i} style_guides length is {len(style_guides)}")
            logger.info(f"style guide {i} is {style_guides[i][:100]}")
        else:
            messages.append(
                {
                    "role": "assistant",
                    "content": runpod_response,
                }
            )
            return runpod_response


# def get_updated_document():
#     logger.info("Getting updated document")
#     update_request = ("Please provide an updated document with your previous recommendations applied.")
#     response = send_chat_message(
#         messages=st.session_state.messages,
#         previous_recommendations=st.session_state.get("session_history", "no history"),
#         additional_context=st.session_state.get("file_contents", "nothing uploaded"),
#         message_history=message_history,
#         **runpod_credentials_chat,
#     )

