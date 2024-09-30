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

const DocAnalystContent = styled.div`
  flex: 1;
  width: 100%;
  padding: 20px;
`;

const FileUploadContainer = styled.div`
  margin-top: 100px;
`;

const DocAnalystContainer = styled.div`
  display: flex;
`;

function DocAnalyst() {
  const { user } = useAuth();
  const userid = user?.profile?.sub ?? 'unknown';

  return (
    <DocAnalystContainer>
      <Sidebar>
        <FileUploadContainer>
          <h1>Upload Your Files</h1>
          <FileUpload
            userid={userid}
            allowedMimeTypes={config.allowedMimeTypes}
            getPresignedUrlEndpoint={config.getPresignedUrlEndpoint}
          />
        </FileUploadContainer>
      </Sidebar>
      <DocAnalystContent>
        <h1>Doc Analyst</h1>
        <p>Coming soon...</p>
      </DocAnalystContent>
    </DocAnalystContainer>
  );
}

export default DocAnalyst;
