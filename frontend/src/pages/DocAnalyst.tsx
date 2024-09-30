import React from 'react';
import styled from 'styled-components';
import FileUpload from '../components/ui/FileUpload';
import { useAuth } from '../integration/AuthContext';
import { config } from '../integration/config';

const Sidebar = styled.aside`
  width: 200px;
  background-color: #f0f0f0;
  padding: 20px;
  background-image: url('scoti_logo.gif');
  background-repeat: no-repeat;
  background-position: top -20px right 50%;
  background-size: 50%;
`;

const DocAnalystContainer = styled.div`
  width: 100%;
  padding: 20px;
`;

function DocAnalyst() {
  const { user } = useAuth();
  const userid = user?.profile?.sub ?? 'unknown';

  return (
    <>
      <Sidebar>
        <div>
          <h1>Upload Your Files</h1>
          <FileUpload
            userid={userid}
            allowedMimeTypes={config.allowedMimeTypes}
            getPresignedUrlEndpoint={config.getPresignedUrlEndpoint}
          />
        </div>
      </Sidebar>
      <DocAnalystContainer>
        <h1>Doc Analyst</h1>
        <p>Coming soon...</p>
      </DocAnalystContainer>
    </>
  );
}

export default DocAnalyst;
