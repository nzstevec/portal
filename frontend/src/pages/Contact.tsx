import React from 'react';
import styled from 'styled-components';

const ContactContainer = styled.div`
  padding: 20px;
`;

const Contact: React.FC = () => (
  <ContactContainer>
    <h1>Contact Us</h1>
    <p>Get in touch with us for any inquiries.</p>
    <p>Email: contact@example.com</p>
    <p>Phone: (123) 456-7890</p>
  </ContactContainer>
);

export default Contact;