import React, { useState } from 'react';
import styled from 'styled-components';

const ExpanderContainer = styled.div`
    border: 1px solid rgba(46, 45, 144, 0.855);
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
`;

const ExpanderButton = styled.button`
  display: grid;
  grid-template-columns: 95% 5%;
  width: 100%;
  background-color: rgb(255, 255, 255);
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 18px;
  font-weight: bold;
  font-style: italic;
  cursor: pointer;

  &:hover {
    background-color: #e6e6e6;
  }

  &:active {
    background-color: #d9d9d9;
  }
`;

interface ExpanderProps {
  title: string;
  initialyExpanded: boolean;
  children: React.ReactNode;
}

const Expander: React.FC<ExpanderProps> = ({ title, initialyExpanded, children }) => {
  const [expanded, setExpanded] = useState(initialyExpanded);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <ExpanderContainer>
      <ExpanderButton onClick={handleToggle}>
            <div style={{ justifySelf: 'start'}}>{title}</div>
            <div>{expanded ? '˅' : '˄'}</div>
      </ExpanderButton>
      {expanded && <div>{children}</div>}
    </ExpanderContainer>
  );
};

export default Expander;