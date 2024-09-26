import time
from datetime import datetime
from random import randint
import streamlit as st
from streamlit_extras.bottom_container import bottom

from api.runpod_utils import runpod_call
from api.utils import  runpod_credentials_chat, logging, invoke_openai_directly_with_messages
from gpt.parsing import process_files
from gpt.prompts import CHAT_PROMPT_WITH_FILES, CHAT_PROMPT_WITHOUT

logger = logging.getLogger("doc_analyst_page")

SCOTI_AVATAR = "static/scoti_avatar.png"
USER_AVATAR = "static/user_avatar.png"


def clear_session_state():
    st.session_state["messages"] = [
        {
            "role": "assistant",
            "content": "How can I help you?",
            "avatar": SCOTI_AVATAR
        }
    ]
    st.session_state["uploaded_files_state"] = []
    st.session_state["file_contents"] = ""
    st.session_state["widget_key"] = str(randint(1000, 100000000))


def init_session_state():
    if "messages" not in st.session_state:
        st.session_state["messages"] = [
            {
                "role": "assistant",
                "content": "How can I help you?",
                "avatar": SCOTI_AVATAR
            }
        ]

    # clear_chatbot_messages()

    if "uploaded_files_state" not in st.session_state:
        st.session_state["uploaded_files_state"] = []

    if "file_contents" not in st.session_state:
        st.session_state["file_contents"] = ""

    if 'rerun' not in st.session_state:
        st.session_state.rerun = False

    if "ai_provider" not in st.session_state:
        st.session_state.ai_provider = "SCOTi"

    if 'widget_key' not in st.session_state:
        st.session_state.widget_key = str(randint(1000, 100000000))        


def clear_chatbot_messages():
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": "What would you like to ask today?",
            "avatar": SCOTI_AVATAR,
        }
    ]


def onClick():
    st.toast("Query passed to SCOTi ...")


def send_chat_message(messages, rdti_template, additional_context, **runpod_credentials):
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
            if st.session_state.ai_provider == "SCOTi":
                runpod_response = runpod_call(
                    messages=messages, **runpod_credentials)
            else:
                runpod_response = invoke_openai_directly_with_messages(messages)
        except TimeoutError:
            logger.error("Timeout error calling runpod")
            st.error(
                f"SCOTi is taking too long to respond. Please try again later.")
            runpod_response = "Argh!!! I took too long to respond. please try again"
        except Exception as e:
            logger.error("Houston, we have a %s",
                         "major problem", exc_info=True)
            st.error(f"An error occurred in SCOTi: {e}")
            runpod_response = "#@!# oops, something went wrong, please try again"
        end = datetime.now()
        logger.info(
            f"Got a {len(runpod_response)} character response. Call took {end-start}")
        return runpod_response


def get_user_input(message_history):
    logger.info("Getting user input")
    if user_chat_message := st.chat_input("Chat with SCOTi here."):
        st.session_state.messages.append(
            {"role": "user", 
            "content": user_chat_message, 
            "avatar": USER_AVATAR}
        )
        message_history.chat_message("user", avatar=USER_AVATAR).write(user_chat_message)
        logger.info(f"state updated with user query before AI call, msg count {len(st.session_state.messages)}")
        response = send_chat_message(
            messages=st.session_state.messages,
            rdti_template=st.session_state.get(
                "rimon_template_contents", "nothing uploaded"),
            additional_context=st.session_state.get(
                "file_contents", "nothing uploaded"),
            **runpod_credentials_chat,
        )
        logger.info("after AI call")
        st.session_state.messages.append({"role": "assistant", "content": response, "avatar": SCOTI_AVATAR})
        logger.info(f"AI response added to state, msg count {len(st.session_state.messages)}")
        message_history.chat_message("assistant", avatar=SCOTI_AVATAR).write(response)


def side_bar():
    with st.sidebar:
        # Upload files
        uploaded_files = st.file_uploader(
            "**Before starting your chat with SCOTi please upload all the documents you want SCOTi to know about**.",
            type=["txt", "pdf", "docx", "rtf"],
            accept_multiple_files=True,
            key=st.session_state.widget_key,
        )
        if uploaded_files:
            if st.session_state["uploaded_files_state"] != uploaded_files:
                st.session_state["uploaded_files_state"] = uploaded_files
                condence_uploads = False
                logger.info("Uploaded files: %s", uploaded_files)
                with st.spinner("Loading Documents"):
                    (
                        st.session_state["file_contents"],
                        st.session_state["rimon_template_contents"],
                        st.session_state["total_tokens"],
                    ) = process_files(
                        uploaded_files,
                        summarize=condence_uploads,
                        **runpod_credentials_chat,
                    )

                if st.session_state["total_tokens"] > 60000:
                    st.warning(
                        "Input files too long. Report generation is likely to fail. Please choose different files to upload.",
                        icon="⚠️",
                    )
                # time.sleep(5)
        st.toggle("Clear Current Docs and Restart Chat",
                  on_change=clear_session_state)


def display_doc_analyst_page():
    # Set the page configuration with the sidebar expanded
    # st.set_page_config(
    #     layout="wide",
    #     initial_sidebar_state="expanded"
    # )
    init_session_state()
    st.title("🕵️‍♂️ Doc Analyst SCOTi")
    side_bar()
    markdown = """
<div style='padding-top: 1rem; text-align: center; margin-bottom: -1.2rem;'>
Chat History
</div>
    """
    st.markdown(markdown, unsafe_allow_html=True)
    # if "portal-high-security" in st.session_state['user']['roles']:
    #     c1, _, c2 = st.columns([4, 4, 2])
    #     ai_provider = c2.selectbox(
    #         "AI Provider",
    #         ["SCOTi", "OpenAI"]
    #     )
    #     st.session_state.ai_provider = ai_provider

    # history = st.session_state.messages
    message_history = st.container(border=True,)
    for msg in st.session_state.messages:
        message_history.chat_message(
            msg["role"],
            avatar=msg["avatar"]
        ).write(msg["content"])

    with bottom():
        get_user_input(message_history)


if __name__ == "__main__":
    display_doc_analyst_page()
