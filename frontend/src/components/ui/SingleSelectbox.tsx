import React, { useState } from 'react';
import styled from 'styled-components';

interface SelectboxProps {
  options: string[];
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

const SelectboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;
  border: 1px solid rgba(187, 187, 202, 0.855);
  width: 350px;
  margin-bottom: 8px;
`;

const SelectedItemsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 8px;
  font-size: 12px;
  color: #999;
  width: inherit;
  white-space: nowrap;
  overflow-x: scroll;
`;

const SelectedItem = styled.span`
  display: flex;
  background-color: #90c590;
  color: black;
  border-radius: 4px;
  padding: 4px 8px;
  border: 1px solid #585858;
  position: relative;
  font-size: 11px;

  button {
    margin-left: 8px;
    background: transparent;
    border: none;
    color: #ff0000;
    cursor: pointer;
    font-size: 12px;
    padding: 0;
  }
`;

const LabelAndButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  align-self: stretch;
  background-color: rgba(217, 217, 219, 0.836);
  border-bottom: 1px solid rgba(187, 187, 202, 0.855);
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: bold;
  padding-left: 4px;
  text-align: center;
  width: 100%;
`;

const ToggleButton = styled.button`
  background-color: #3189ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
`;

const HiddenSelect = styled.select<{ open: boolean }>`
  width: inherit;
  background-color: rgb(244, 244, 247);
  height: auto;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
  color: black;
  display: ${({ open }) => (open ? 'block' : 'none')};

  option {
    padding: 4px;
  }
`;

const SingleSelectbox: React.FC<SelectboxProps> = ({
  options,
  label,
  value,
  placeholder = 'Select an option',
  onChange,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(value || '');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const currentSelection = event.target.value;

    setSelectedValue(currentSelection);
    onChange(currentSelection);
  };

  const handleDelete = () => {
    setSelectedValue('');
    onChange('');
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleBlur = () => {
    setDropdownOpen(false);
  };

  return (
    <SelectboxContainer>
      <LabelAndButtonContainer>
        <Label>{label}</Label>
        <ToggleButton onClick={toggleDropdown}>
          {dropdownOpen ? '˄' : '˅'}
        </ToggleButton>
      </LabelAndButtonContainer>
      <SelectedItemsContainer>
        {selectedValue === '' ? (
          <SelectedItem key={placeholder}>{placeholder}</SelectedItem>
        ) : (
          <SelectedItem key={selectedValue}>
            {selectedValue}
            <button onClick={handleDelete}>x</button>
          </SelectedItem>
        )}
      </SelectedItemsContainer>
      <HiddenSelect
        value={selectedValue}
        onChange={handleChange}
        onBlur={handleBlur}
        open={dropdownOpen}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </HiddenSelect>
    </SelectboxContainer>
  );
};

export default SingleSelectbox;
