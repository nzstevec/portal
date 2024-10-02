import React, { useState } from 'react';
import styled from 'styled-components';

interface SelectboxProps {
  options: string[];
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const SelectboxContainer = styled.div`
  /* border: 1px solid rgba(46, 45, 144, 0.855); */
  /* border-radius: 4px; */
  /* padding: 16px; */
  /* margin-bottom: 0 8px; */
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;   
`;

const Select = styled.select`
  /* border: 1px solid rgba(46, 45, 144, 0.855);
  border-radius: 4px;
  padding: 0 8px; */
  /* margin-bottom: 16px; */
  width: max-content;
  background-color: rgba(49, 51, 63, 0.2);
`;

const Selectbox: React.FC<SelectboxProps> = ({
  options,
  label,
  value,
  onChange,
}) => {
  const [selectedValue, setSelectedValue] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
    onChange(event.target.value);
  };

  return (
    <SelectboxContainer>
      <label><b>{label}</b></label>
      <Select value={selectedValue} onChange={handleChange}>
          <option value="" disabled selected>Select an option</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
    </SelectboxContainer>
  );
};

export default Selectbox;