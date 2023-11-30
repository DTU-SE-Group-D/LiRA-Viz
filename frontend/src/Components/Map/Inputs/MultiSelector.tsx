import React, { useState } from 'react';
import Select from 'react-select';

import '../../../css/multiselector.css';

interface MultiSelectProps {
  /** The function to call when an option is selected */
  handleSelectionChange: (value: any) => void;
  /** The options to show in the dropdown menu */
  options: any;
  /** The text to show in the selector */
  placeholder: string;
  /** The default chosen value in the selector */
  defaultValue?: any;
  /** The children for the MultiSelector */
  children?: React.ReactNode;
  /** Allow NOT to display any type on the multi select filter */
  allowFullClear?: boolean;
}

/**
 * MultiSelector is a component that is a dropdown list
 * that allows for multiple selection
 *
 * @author Hansen
 */

const MultiSelector: React.FC<MultiSelectProps> = ({
  handleSelectionChange,
  children,
  options,
  placeholder,
  defaultValue,
  allowFullClear = true,
}) => {
  const [value, setValue] = useState<{ value: string; label: string }[]>([
    defaultValue,
  ]);

  return (
    <div className="input-selector-container">
      <>
        <Select
          isMulti
          closeMenuOnSelect={false}
          options={options}
          onChange={(newValue) => {
            if (newValue.length === 0 && !allowFullClear) {
              setValue(value);
            } else {
              setValue(newValue.map((item) => item));
              handleSelectionChange(newValue);
            }
          }}
          value={value}
          placeholder={placeholder}
          isClearable={allowFullClear}
          className="react-select-container"
          classNamePrefix="react-select"
        ></Select>
        {children}
      </>
    </div>
  );
};

export default MultiSelector;
