import React, { useState } from 'react';
import styled from 'styled-components';
import { IoMdSend } from "react-icons/io";
import Selectbox from '../components/ui/Selectbox';
import BaseApiResponse, { apiService } from '../integration/ApiService';
import FeedbackDtoImpl from '../model/FeedbackDto';

interface FormData {
  category: string;
  feedback: string;
}

const FeedbackContainer = styled.div`
  padding: 20px;
  margin-left: 200px;
`;

const FormContainer = styled.form`
  border: 1px solid rgba(46, 45, 144, 0.855);
  border-radius: 4px;
  padding: 16px;
  max-width: 90%;
  /* margin-bottom: 16px; */
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Button = styled.button`
  background-color: rgba(46, 45, 144, 0.855);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  width: max-content;
  cursor: pointer;
  align-self: flex-end;
`;

const TextArea = styled.textarea`
  border: 1px solid rgba(46, 45, 144, 0.855);
  border-radius: 4px;
  width: 100%;
  height: 200px;
  background-color: rgba(49, 51, 63, 0.2);
`;
function Feedback() {
  const categories = [
    'Feature Request',
    'Output Anomoly',
    'Question',
    'Comment',
  ];

  const [formData, setFormData] = useState<FormData>({
    category: '',
    feedback: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [key, setKey] = useState(0);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    // Call API or perform action here
    console.log('Feedback submitted:', formData);
    const feedbackDto = new FeedbackDtoImpl(
      formData.category,
      formData.feedback,
      'someone@somewhere.com'
    );
    apiService
      .createFeedback(feedbackDto)
      .then((response: BaseApiResponse) => {
        console.log(response);
        setFormData({ category: '', feedback: '' });
        setSubmitting(false);
        setKey(key + 1);
      })
      .catch((error: BaseApiResponse) => {
        console.error(error);
      });
  };

  return (
    <FeedbackContainer>
      <h1>Feedback</h1>
      <FormContainer onSubmit={handleSubmit}>
        <Selectbox
          key={key}
          options={categories}
          label="Select the category for your feedback:"
          value={formData.category}
          onChange={(category) =>
            setFormData({ ...formData, category: category })
          }
        />
        <label>
          <b>Provide your feedback and suggestions here:</b>
        </label>
        <TextArea
          value={formData.feedback}
          onChange={(event) =>
            setFormData({ ...formData, feedback: event.target.value })
          }
        />
        <Button type="submit" disabled={submitting}>
          <IoMdSend />
        </Button>
      </FormContainer>
    </FeedbackContainer>
  );
}

export default Feedback;
