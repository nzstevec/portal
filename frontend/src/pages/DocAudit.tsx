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
import MultiSelectbox from '../components/ui/MultiSelectbox';

const scoti_avatar = '/scoti_avatar.png';
const user_avatar = '/user_avatar.png';
const runningManGif = '/running.gif';

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
  background-color: #f3f2eef6;
  padding: 20px;
  background-image: url('scoti_logo.gif');
  background-repeat: no-repeat;
  background-position: top -20px right 50%;
  background-size: 50%;
`;

const DocAuditContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  margin-left: 200px;
`;

const FileUploadContainer = styled.div`
  flex: 1;
  margin-top: 100px;
  max-height: 75vh;
`;

const DocAuditContainer = styled.div`
  display: flex;
  padding: 20px;
`;

const ChatInput = styled.div`
  width: 100vw;
  height: 40px;
  position: fixed;
  bottom: 20px;
  display: flex;
  gap: 10px;
  padding: 20px 10px 20px 0px;
  flex: 1;
`;

const Input = styled.input`
  width: 75%;
`;

const Button = styled.button`
  background-color: rgba(46, 45, 144, 0.855);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  width: 40px;
  cursor: pointer;
`;

const DownloadButton = styled(Button)`
  width: max-content;
  color: rgba(46, 45, 144, 0.855);
  background-color: white;
  font-weight: bold;
`;

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
`;

const RunningManImg = styled.img`
  max-width: 2%;
  opacity: 0.3;
  height: auto;
`;

const styleguideSections = [
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

function DocAudit() {
  const { user } = useAuth();
  const userid = user?.profile?.sub ?? 'unknown';
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const filesContext = useContext(FileContext);
  const [selectedSections, setSelectedSections] = useState<string[]>([])

  if (!filesContext) {
    throw new Error('FileUpload must be used within a FileContextProvider');
  }

  const { files } = filesContext;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleClick = async () => {
    const newMessage: ChatMessage = {
      id: (messages.length + 1).toString(),
      text: inputValue,
      avatar: user_avatar,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');

    const filenames = Array.from(files)
      .map((file) => file.file.name)
      .join(', ');

    const request = new QueryRequestDto(
      userid,
      filenames,
      inputValue,
      'doc_analyst'
    );

    try {
      setLoading(true);
      const response = await apiService.sendQueryRequest(request);
      setLoading(false);

      if (response instanceof QueryResponseDtoImpl) {
        const botMessage: ChatMessage = {
          id: (messages.length + 2).toString(),
          text: response.ai_response,
          avatar: scoti_avatar,
          sender: 'bot',
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleClick();
    }
  };

  const downloadMarkdown = () => {
    const markdownContent = messages
      .map(
        (msg) =>
          `${msg.sender === 'user' ? '**User**' : '**Bot**'}: ${msg.text}`
      )
      .join('\n\n');

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chat_history.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DocAuditContainer>
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
      <DocAuditContent>
        <HeaderWrapper>
          <h3>Chat History</h3>
          <DownloadButton onClick={downloadMarkdown}>
            Save Chat History?
          </DownloadButton>
          {loading && <RunningManImg src={runningManGif} alt="Loading..." />}
        </HeaderWrapper>
        <MultiSelectbox 
          label='What part of style guide should be applied?'
          options={styleguideSections}
          value={selectedSections}
          placeholder="All sections."
          onChange={(value) => setSelectedSections(value)}
        />
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
      </DocAuditContent>
    </DocAuditContainer>
  );
}

export default DocAudit;
