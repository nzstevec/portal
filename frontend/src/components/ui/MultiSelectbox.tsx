import React, { useState } from 'react';
import styled from 'styled-components';

interface SelectboxProps {
  options: string[];
  label: string;
  value: string[];
  placeholder?: string;
  onChange: (value: string[]) => void;
  auditActive: boolean;
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
  /* margin-bottom: 8px; */
  font-size: 12px;
  color: #999;
  width: inherit;
  white-space: nowrap;
  overflow-x: auto;

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
  justify-self: flex-end;
  /* position: relative;
  right: -82px;
  top: 2px; */
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

const MultiSelectbox: React.FC<SelectboxProps> = ({
  options,
  label,
  value,
  placeholder = 'Select an option',
  onChange,
  auditActive,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(value || []);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(true);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const currentSelection = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );

    const newSelections = Array.from(
      new Set([...selectedValues, ...currentSelection])
    );

    setSelectedValues(newSelections);
    onChange(newSelections);
  };

  const handleDelete = (itemToDelete: string) => {
    const newSelections = selectedValues.filter(
      (item) => item !== itemToDelete
    );
    setSelectedValues(newSelections);
    onChange(newSelections);
  };

  const availableOptions = options.filter(
    (option) => !selectedValues.includes(option)
  );

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleBlur = () => {
    setDropdownOpen(false);
  };

  return (
    <SelectboxContainer>
      {/* <LabelAndButtonContainer> */}
        <Label>{label}</Label>
        {/* <ToggleButton onClick={toggleDropdown}>
          {dropdownOpen ? '˄' : '˅'}
        </ToggleButton>
      </LabelAndButtonContainer> */}
      <SelectedItemsContainer>
        {selectedValues.length === 0 ? (
          <SelectedItem key={placeholder}>{placeholder}</SelectedItem>
        ) : (
          selectedValues.map((item) => (
            <SelectedItem key={item}>
              {item}
              <button onClick={() => handleDelete(item)}>x</button>
            </SelectedItem>
          ))
        )}
      </SelectedItemsContainer>
      <HiddenSelect
        multiple
        value={[]}
        onChange={handleChange}
        onBlur={handleBlur}
        open={!auditActive} //{dropdownOpen}
      >
        {availableOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </HiddenSelect>
    </SelectboxContainer>
  );
};

export default MultiSelectbox;
