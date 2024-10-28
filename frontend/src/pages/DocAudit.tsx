import React, { useState, useContext, useEffect } from 'react';
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
import SingleSelectbox from '../components/ui/SingleSelectbox';
import DocAuditRequestDto from '../model/DocAuditRequestDto';
import DocAuditResponseDtoImpl from '../model/DocAuditResponseDto';

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

const AuditOutput = styled(DocAuditContent)`
  margin-left: 0px;
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

const Label = styled.label`
  font-size: 12px;
  font-weight: bold;
  padding: 10px;
`;

const Button = styled.button`
  background-color: rgba(46, 45, 144, 0.855);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  width: 40px;
  cursor: pointer;

  &:disabled {
    background-color: rgba(150, 150, 150, 0.5); /* Example disabled color */
    cursor: not-allowed;
  }
`;

const DownloadButton = styled(Button)`
  width: max-content;
  color: rgba(46, 45, 144, 0.855);
  background-color: white;
  font-weight: bold;
`;

const HeaderWrapper = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  h3 {
    justify-self: center;
  }
`;

const DocSelectWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  div, img {
    justify-self: center;
  }
`;

const LabelWithButton = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr;
  justify-items: center;
  align-items: self-start;
  text-align: center;
  width: 100%;
  border: 1px solid rgba(187, 187, 202, 0.855);
  margin-bottom: 8px;
`;

const RunningManImg = styled.img`
  max-width: 10%;
  opacity: 0.3;
  height: auto;
`;

const styleguideSections = [
  'accessible-and-inclusive-content_1',
  'accessible-and-inclusive-content_2',
  'referencing-and-attribution_1',
  'referencing-and-attribution_2',
  'referencing-and-attribution_3',
  'structuring-content_1',
  'structuring-content_2',
  'writing-and-designing-content_1',
  'writing-and-designing-content_2',
  'grammar-punctuation-and-conventions_1',
  'grammar-punctuation-and-conventions_2',
  'grammar-punctuation-and-conventions_3',
  'grammar-punctuation-and-conventions_4',
  'grammar-punctuation-and-conventions_5',
];

function DocAudit() {
  const { user } = useAuth();
  const userid = user?.profile?.sub ?? 'unknown';
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [auditActive, setAuditActive] = useState<boolean>(false);
  const filesContext = useContext(FileContext);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string>('');

  if (!filesContext) {
    throw new Error('FileUpload must be used within a FileContextProvider');
  }

  const { files } = filesContext;
  const fileNames = Array.from(files).map((file) => file.file.name);

  // const startAuditOpenai = async () => {
  //   await startAudit('openai');
  // };

  const startAudit = async (event: React.MouseEvent<HTMLButtonElement>, ai_provider: string = 'scoti') => {
    if (event.shiftKey) {
      ai_provider = 'openai';
    }
    setAuditActive(true);
    const newMessage: ChatMessage = {
      id: (messages.length + 1).toString(),
      text: "audit my document against the style guide's recommendations",
      avatar: user_avatar,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const request = new DocAuditRequestDto(
      userid,
      selectedFilename,
      selectedSections.join(', '),
      'doc_audit',
      ai_provider
    );

    try {
      setLoading(true);
      const eventSource = new EventSource(config.sseAiDocAuditEndpoint + '?payload=' + JSON.stringify(request));

      eventSource.onmessage = (event) => {
        const response: DocAuditResponseDtoImpl = JSON.parse(event.data);
        console.log('response', response);
        const botMessage: ChatMessage = {
          id: (messages.length + 2).toString(),
          text: response.ai_response,
          avatar: scoti_avatar,
          sender: 'bot',
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        
      };

      eventSource.onerror = (err) => {
        console.error('EventSource failed:', err);
        eventSource.close();
        setLoading(false);
      };

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // const handleClickOpenai = async (event: React.MouseEvent<HTMLButtonElement>) => {
  //   event.preventDefault();
  //   event.currentTarget.blur();
  //   await handleClick('openai');
  // };

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>, ai_provider: string = 'scoti') => {
    if (event.shiftKey) {
      ai_provider = 'openai';
    }
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
      'doc_audit',
      ai_provider
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

  // const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (event.key === 'Enter') {
  //     event.preventDefault();
  //     handleClick();
  //   }
  // };

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
        <DocSelectWrapper>
          <SingleSelectbox
            label="What document should SCOTi audit"
            options={fileNames}
            value=""
            placeholder="...select an uploaded document"
            onChange={(value) => setSelectedFilename(value)}
            auditActive={auditActive}
          />
          <MultiSelectbox
            label="What part of the style guide should SCOTi apply"
            options={styleguideSections}
            value={selectedSections}
            placeholder="All sections."
            onChange={(value) => setSelectedSections(value)}
            auditActive={auditActive}
          />
          <LabelWithButton>
            <Label>Start style guide review?</Label>
            <Button onClick={(event) =>startAudit(event)}
              disabled={selectedFilename === '' || auditActive}>
              <IoMdSend />
            </Button>
          </LabelWithButton>
          {loading && (
            <RunningManImg src={runningManGif} alt="Loading..." />
          )}
        </DocSelectWrapper>
        {auditActive && (
          <AuditOutput>
            <HeaderWrapper>
              <h3>Chat History</h3>
              <DownloadButton onClick={downloadMarkdown}>
                Save Chat History?
              </DownloadButton>
            </HeaderWrapper>
            <ChatHistory messages={messages} />
            <ChatInput>
              <Input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                // onKeyDown={handleKeyDown}
                placeholder="Chat with SCOTi here..."
              />
              <Button onClick={(event) => handleClick(event)}>
                <IoMdSend />
              </Button>
            </ChatInput>
          </AuditOutput>
        )}
      </DocAuditContent>
    </DocAuditContainer>
  );
}

export default DocAudit;
