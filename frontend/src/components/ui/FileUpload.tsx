// FileUpload.tsx

import React, { useState, useEffect, ChangeEvent, useContext } from 'react';
import styled from 'styled-components';
import CreatePresignedUrlDtoImpl from '../../model/CreatePresignedUrlDto';
import BaseApiResponse, { apiService } from '../../integration/ApiService';
import PresignedUrlDto from '../../model/PresignedUrlDto';
import { FileContext } from '../../integration/FileContext';

// Styled Components

const FileUploadOuter = styled.div`
  /* border: 2px dashed #4a90e2; */
  /* padding: 20px; */
  text-align: center;
  /* border-radius: 10px; */
  cursor: pointer;
  color: #4a90e2;
  transition: background-color 0.3s;

  &::after {
    content: "500K character upload limit (250-350 A4 pages).";
    position: relative;
    bottom: 0;
    left: 0;
    /* background-color: #333; */
    /* color: hsl(0, 0%, 3.1372549019607843%); */
    padding: 5px;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover::after {
    opacity: 1;
    /* background-color: #fff; */
  }
`;

const UploadContainer = styled.div`
  border: 2px dashed #4a90e2;
  padding: 20px;
  text-align: center;
  border-radius: 10px;
  cursor: pointer;
  color: #4a90e2;
  transition: background-color 0.3s;
`;


const HiddenInput = styled.input`
  display: none;
`;

const FileList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 20px;
`;

const FileItem = styled.li`
  margin-bottom: 10px;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 5px;

  &::after {
    content: '';
    display: block;
    height: 10px;
    width: ${({ progress }) => progress}%;
    background-color: #4caf50;
    transition: width 0.3s;
  }
`;

const ErrorText = styled.p`
  color: red;
  margin-top: 10px;
`;

// Types
interface FileUploadProps {
  userid: string;
  allowedMimeTypes: string[];
  getPresignedUrlEndpoint: string;
}

export interface UploadFile {
  file: File;
  progress: number;
  error: string | null;
}

function getMimeType(filename: string) {
  const extension = filename?.split('.')?.pop()?.toLowerCase() || '';
  
  // Mapping of extensions to MIME types
  const mimeTypes : { [key: string]: string } = {
    'txt': 'text/plain',
    'html': 'text/html',
    'json': 'application/json',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'pdf': 'application/pdf',
    '': 'application/octet-stream',
    // Add other mappings as needed
  };

  return mimeTypes[extension] || 'application/octet-stream'; // Default: binary stream
}

const FileUpload: React.FC<FileUploadProps> = ({
  userid,
  allowedMimeTypes,
  getPresignedUrlEndpoint,
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const filenamesContext = useContext(FileContext);

  if (!filenamesContext) {
    throw new Error("FileUpload must be used within a FileContextProvider");
  }

  const { filenames, setFilenames } = filenamesContext;

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const fetchedFilenames: string[] = await apiService.getUploadedFilenames(userid); 
        const fetchedFiles = [];
        for (const filename of fetchedFilenames) {
          const mimeType = getMimeType(filename);
          const file = new File([], filename, { type: mimeType });
          fetchedFiles.push({ file: file, progress: 100, error: null });
        }
        setFiles(fetchedFiles); // Update the state with the filenames
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles(); // Trigger the fetch operation
  }, []); // The effect runs only once on component mount

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (!allowedMimeTypes.includes(file.type)) {
        setError(`File type not allowed: ${file.type}`);
        continue;
      }

      newFiles.push({
        file,
        progress: 0,
        error: null,
      });
    }

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);

    // Upload each file
    newFiles.forEach(uploadFile);
    if (files.length > 0) {
      const names = Array.from(files).map(file => file.file.name).join(', ');
      setFilenames(names);
    }
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    const { file } = uploadFile;
    try {
      // Step 1: Create a presigned URL
      const request = new CreatePresignedUrlDtoImpl(
        userid,
        file.name,
        file.type
      );
      apiService
        .createPresignedUrl(request)
        .then((response: PresignedUrlDto) => {
          console.log(response);
          const { presignedUrl, fileUrl } = response;
          console.log(presignedUrl, fileUrl);
          // Step 2: Upload the file to S3 using the presigned URL
          apiService.uploadToPresignedUrl(presignedUrl, file, setFiles);
        })
        .catch((error: BaseApiResponse) => {
          console.error(error);
        });
        const newFilenames = filenames.length === 0 ? file.name : filenames + ', ' + file.name;
        setFilenames(newFilenames)
      // Optionally, you can store the fileUrl or perform further actions
    } catch (err: any) {
      console.error(err);
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file === file
            ? { ...f, error: err.response?.data?.message || err.message }
            : f
        )
      );
    }
  };

  const handleContainerClick = () => {
    const fileInput = document.getElementById('file-upload-input');
    fileInput?.click();
  };

  return (
    <FileUploadOuter>
      <UploadContainer onClick={handleContainerClick}>
        Click or Drag files to upload
        <HiddenInput
          type="file"
          id="file-upload-input"
          multiple
          accept={allowedMimeTypes.join(',')}
          onChange={handleFileChange}
        />
      </UploadContainer>
      {error && <ErrorText>{error}</ErrorText>}
      <FileList>
        {files.map((fileObj, index) => (
          <FileItem key={index}>
            {fileObj.file.name}
            <ProgressBar progress={fileObj.progress} />
            {fileObj.error && <ErrorText>{fileObj.error}</ErrorText>}
          </FileItem>
        ))}
      </FileList>
    </FileUploadOuter>
  );
};

export default FileUpload;
