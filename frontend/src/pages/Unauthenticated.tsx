import React from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import Expander from '../components/ui/Expander';

const welcome = `
Welcome to the SCOTi AI Sandbox.

This sandbox provides secure access to a set of beta version SCOTi AI agents.

The purpose is User experimentation; to consider “what might be possible” with a sovereign SCOTi AI workbench, or GenAI workshop or even an AI factory.

Access to this sandbox is restricted to users with an account. If you do not have an account please contact us at steve@aeq.services.


`;

const UnauthenticatedContainer = styled.div`
  padding: 20px 80px;
`;

function UnAuthenticated() {
  return (
    <UnauthenticatedContainer>
      <Expander title={'SCOTi Portal'} initialyExpanded={true}>
        <ReactMarkdown>{welcome}</ReactMarkdown>
      </Expander>
    </UnauthenticatedContainer>
  );
}

export default UnAuthenticated;
