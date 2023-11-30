import React from 'react';
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
}) => {
  return (
    <div className="input-selector-container">
      <>
        <Select
          isMulti
          closeMenuOnSelect={false}
          options={options}
          onChange={handleSelectionChange}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="react-select-container"
          classNamePrefix="select"
        ></Select>
        {children}
      </>
    </div>
  );
};

export default MultiSelector;
