import streamlit as st
import streamlit.components.v1 as components
from urllib.parse import urlparse

# Function to display the appropriate page based on the path
def display_page(path):
    if path == "doc-analyst":
        with open("doc_analyst_page.py") as f:
            exec(f.read(), globals())
    # elif path == "doc-audit":
    #     with open("doc_audit_page.py") as f:
    #         exec(f.read(), globals())
    else:
        st.write("Page not found!")

st.set_page_config(layout="wide", initial_sidebar_state="expanded")        
# Parse the query parameters
query_params = st.experimental_get_query_params()
path = query_params.get('page', [''])[0]

# Display the corresponding page
display_page(path)

# Instructions for the user
# st.sidebar.header("Navigation")
# st.sidebar.write("Use the following links to navigate:")
# st.sidebar.write('[Doc Analyst](?page=doc-analyst)')
# st.sidebar.write('[Doc Audit](?page=doc-audit)')
