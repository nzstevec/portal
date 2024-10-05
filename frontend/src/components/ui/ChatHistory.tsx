import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

export interface ChatMessage {
  id: string;
  text: string;
  avatar: string;
  sender?: 'user' | 'bot';
}

export const ChatContainer = styled.div`
  width: 70vw;
  /* max-width: 80vh; */
  border-radius: 8px;
  background-color: #f9f9f9;
  max-height: 71vh; 
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ccc;
  flex: 1;
`;

export const MessageWrapper = styled.div<{ sender?: 'user' | 'bot' }>`
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  padding: 5px;
  border-radius: 3px;
  background-color: #f1f1f1;
  /* flex-direction: ${({ sender }) =>
    sender === 'user' ? 'row-reverse' : 'row'}; */
`;

export const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 0 12px;
`;

export const MessageContent = styled.div<{ sender?: 'user' | 'bot' }>`
  background-color: ${({ sender }) => (sender === 'user' ? '#dcf8c6' : '#fff')};
  padding: 10px 14px;
  border-radius: 18px;
  max-width: 70%;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  font-family: 'Calibri', 'Candara', 'Segoe', 'Segoe UI', 'Optima', 'Arial', sans-serif !important;
`;

interface ChatHistoryProps {
  messages: ChatMessage[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ChatContainer>
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      <div ref={chatEndRef} />
    </ChatContainer>
  );
};

interface MessageItemProps {
  message: ChatMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  return (
    <MessageWrapper sender={message.sender}>
      <Avatar src={message.avatar} alt="avatar" />
      <MessageContent sender={message.sender}>
        <ReactMarkdown>{message.text}</ReactMarkdown>
      </MessageContent>
    </MessageWrapper>
  );
};

export default ChatHistory;
