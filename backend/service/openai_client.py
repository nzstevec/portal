from openai import OpenAI
from config import load_environment_variable


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