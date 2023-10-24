import React from 'react';
import '../../../css/selector.css';

interface Props {
  /** The options to show in the dropdown menu */
  options: string[];
  /** The function to call when an option is selected */
  onSelect: (idx: number, selected: string) => void;
}

/**
 * Selector is the component to show a dropdown menu for condition severity.
 */
const Selector: React.FC<Props> = ({ options, onSelect }) => {
  return (
    <div className="input-selector-container">
      <select
        className="input"
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          onSelect(options.indexOf(e.target.value), e.target.value);
        }}
      >
        {options.map((option, i) => (
          <option key={i}>{option}</option>
        ))}
      </select>
    </div>
  );
};

export default Selector;
