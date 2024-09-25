import React from 'react';
import styled from 'styled-components';

const DocAnalystContainer = styled.div`
  width: 100%;
  padding: 20px;
`;

function DocAnalyst() {
  // const currentProtocol = window.location.protocol;
  // const currentDomain = window.location.hostname;
  // const currentPort = window.location.port ? `:${window.location.port}` : '';
  const streamlit_doc_analyst_page = 'https://next.scoti.au/streamlit';

  // Construct the URL for the iframe
  // DocAnalyst is in a streamlit app on port 8501 in the same container as flask on port 8080
  // Flask routes /streamlit to the streamlit app on port 8501
  // const iframeUrl = `${currentProtocol}//${currentDomain}${currentPort}/streamlit`;
  const iframeUrl = streamlit_doc_analyst_page;
  console.log('iframeUrl', iframeUrl);
  return (
    <DocAnalystContainer>
      <h1>Doc Analyst</h1>
      <div style={{ width: '100%', height: '100vh' }}>
        <iframe
          title="Document Analysis"
          src={iframeUrl}
          style={{ width: '100%', height: '100vh', border: 'none' }}
        ></iframe>
      </div>
    </DocAnalystContainer>
  );
}

export default DocAnalyst;
