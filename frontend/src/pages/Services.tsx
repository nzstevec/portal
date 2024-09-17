import React from 'react';
import styled from 'styled-components';

const ServicesContainer = styled.div`
  padding: 20px;
`;

const Services: React.FC = () => (
  <ServicesContainer>
    <h1>Our Services</h1>
    <ul>
      <li>Web Development</li>
      <li>Mobile App Development</li>
      <li>UI/UX Design</li>
    </ul>
  </ServicesContainer>
);

export default Services;