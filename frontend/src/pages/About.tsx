import React from 'react';
import styled from 'styled-components';

const AboutContainer = styled.div`
  padding: 20px;
`;

function About() {
  return (
      <AboutContainer>
        <h1>About Us</h1>
        <p>Learn more about our company and mission.</p>
      </AboutContainer>
  );
}

export default About;
