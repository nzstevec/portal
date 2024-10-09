import React, { useState, useEffect, ChangeEvent, useContext } from 'react';
import styled from 'styled-components';
import CreatePresignedUrlDtoImpl from '../../model/CreatePresignedUrlDto';
import BaseApiResponse, { apiService } from '../../integration/ApiService';
import PresignedUrlDto from '../../model/PresignedUrlDto';
import { FileContext } from '../../integration/FileContext';

// Styled Components

const FileUploadOuter = styled.div`
  text-align: center;
  cursor: pointer;
  color: #4a90e2;
  transition: background-color 0.3s;

  &::after {
    content: "500K character upload limit (250-350 A4 pages).";
    position: relative;
    bottom: 0;
    left: 0;
    padding: 5px;
    border-radius: 4px;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover::after {
    opacity: 1;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: red;
  font-size: 16px;
  cursor: pointer;
  margin-left: 5px;

  &:hover {
    color: darkred;
  }
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
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

const FileUpload: React.FC<FileUploadProps> = ({
  userid,
  allowedMimeTypes,
  getPresignedUrlEndpoint,
}) => {
  
  const [error, setError] = useState<string | null>(null);
  const filesContext = useContext(FileContext);

  if (!filesContext) {
    throw new Error("FileUpload must be used within a FileContextProvider");
  }

  const { files, setFiles } = filesContext;

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const fetchedFilenames: string[] = await apiService.getUploadedFilenames(userid); 
        const fetchedFiles : UploadFile[] = [];
        for (const filename of fetchedFilenames) {
          const mimeType = getMimeType(filename);
          const file = new File([], filename, { type: mimeType });
          fetchedFiles.push({ file: file, progress: 100, error: null });
        }
        console.log("in fetchFiles - resetting files to ", fetchedFiles);
        setFiles(fetchedFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, [setFiles, userid]);

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

    console.log("in handleFileChange - setting files to ", files, " plus ", newFiles);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);

    newFiles.forEach(uploadFile);
    // if (files.length > 0) {
    //   const newFilenames = Array.from(newFiles).map(file => file.file.name).join(', ');
    //   setFilenames((prevFilenames) => {
    //     console.log("in handleFileChange - setting filenames to ", prevFilenames.length === 0 ? newFilenames : `${prevFilenames}, ${newFilenames}`);
    //     return prevFilenames.length === 0 ? newFilenames : `${prevFilenames}, ${newFilenames}`;
    //   });
    // }
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    const { file } = uploadFile;
    try {
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
          apiService.uploadToPresignedUrl(presignedUrl, file, setFiles);
        })
        .catch((error: BaseApiResponse) => {
          console.error(error);
        });
      // const newFilenames = filenames.length === 0 ? file.name : filenames + ', ' + file.name;
      // setFilenames(newFilenames)
    } catch (err: any) {
      console.error(err);
      console.log("in uploadFile - resetting files, dropping one for error: ", err);
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

  const handleDeleteFile = (index: number, filename: string) => {
    // TODO: all deleteUploadedFiles
    apiService.deleteUploadedFiles(userid, filename);
    setFiles(prevFiles => prevFiles.filter((_, fileIndex) => fileIndex !== index));
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
            <DeleteButton onClick={() => handleDeleteFile(index, fileObj.file.name)}>x</DeleteButton>
          </FileItem>
        ))}
      </FileList>
    </FileUploadOuter>
  );
};

export default FileUpload;
