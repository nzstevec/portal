import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import FileUpload from '../components/ui/FileUpload';
import { useAuth } from '../integration/AuthContext';
import { FileContext } from '../integration/FileContext';
import { config } from '../integration/config';
import { IoMdSend } from 'react-icons/io';
import ChatHistory, { ChatMessage } from '../components/ui/ChatHistory';
import QueryRequestDto from '../model/QueryRequestDto';
import { apiService } from '../integration/ApiService';
import QueryResponseDtoImpl from '../model/QueryResponseDto';
import QueryResponseDto from '../model/QueryResponseDto';

const scoti_avatar = '/scoti_avatar.png';
const user_avatar = '/user_avatar.png';

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    text: 'Hello! How can I help you?',
    avatar: scoti_avatar,
    sender: 'bot',
  },
];

const Sidebar = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  width: 10vw;
  min-width: 150px;
  height: 100vh;
  /* border-right: 1px solid #ccc; */
  background-color: #f0f0f0;
  padding: 20px;
  background-image: url('scoti_logo.gif');
  background-repeat: no-repeat;
  background-position: top -20px right 50%;
  background-size: 50%;
`; 

const DocAnalystContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  /* padding: 20px; */
  margin-left: 200px;
`;

const FileUploadContainer = styled.div`
  flex: 1;
  margin-top: 100px;
  max-height: 75vh;
`;

const DocAnalystContainer = styled.div`
  display: flex;
  padding: 20px;
`;

const ChatInput = styled.div`
  width: 100vw;
  position: fixed;
  bottom: 20px;
  display: flex;
  gap: 10px;
  padding: 20px 10px 20px 0px;
  flex: 1;
`;

const Input = styled.input`
  width: 71%;
`;

const Button = styled.button`
  background-color: rgba(46, 45, 144, 0.855);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  width: 50px;
  cursor: pointer;
  align-self: flex-end;
`;

function DocAnalyst() {
  const { user } = useAuth();
  const userid = user?.profile?.sub ?? 'unknown';
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState<string>('');
  const filesContext = useContext(FileContext);

  if (!filesContext) {
    throw new Error('FileUpload must be used within a FileContextProvider');
  }

  const { files, setFiles } = filesContext;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleClick = () => {
    const newMessage: ChatMessage = {
      id: (messages.length + 1).toString(),
      text: inputValue,
      avatar: user_avatar,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');

    const filenames = Array.from(files).map(file => file.file.name).join(', ');

    const request = new QueryRequestDto(
      userid,
      filenames,
      inputValue,
      'doc_analyst'
    );
    apiService.sendQueryRequest(request)
    .then((response) => {
      console.log(response);
      if (response instanceof QueryResponseDtoImpl) {
        const newMessage: ChatMessage = {
          id: (messages.length + 2).toString(),
          text: response.ai_response,
          avatar: scoti_avatar,
          sender: 'bot',
        };
        console.log(newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        console.log(messages);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevents the default action of adding a new line
      handleClick();
    }
  };

  return (
    <DocAnalystContainer>
      <Sidebar>
        <FileUploadContainer>
          <h4>
            Please upload all the documents you want SCOTi to know about before
            starting your chat.
          </h4>
          <FileUpload
            userid={userid}
            allowedMimeTypes={config.allowedMimeTypes}
            getPresignedUrlEndpoint={config.getPresignedUrlEndpoint}
          />
        </FileUploadContainer>
      </Sidebar>
      <DocAnalystContent>
        {/* <h1>Doc Analyst</h1> */}
        <h3>Chat History</h3>
        <ChatHistory messages={messages} />
        <ChatInput>
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Chat with SCOTi here..."
          />
          <Button onClick={handleClick}>
            <IoMdSend />
          </Button>
        </ChatInput>
      </DocAnalystContent>
    </DocAnalystContainer>
  );
}

export default DocAnalyst;
