import React from 'react';
import '../../../css/selector.css';

interface Props {
  /** The options to show in the dropdown menu */
  options: string[];
  /** The function to call when an option is selected */
  onSelect: (idx: number, selected: string) => void;
  /** The default value of the dropdown menu */
  defaultValue?: string;
  /** The label of the dropdown menu */
  label?: string;
  /** The class names of the dropdown menu */
  className?: string;
}

/**
 * Selector is the component to show a dropdown menu for condition.
 *
 * @author Kerbourc'h
 */
const Selector: React.FC<Props> = ({
  options,
  onSelect,
  defaultValue,
  label,
  className,
}) => {
  return (
    <div className={'input-selector-container ' + className}>
      <select
        className="input"
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          onSelect(options.indexOf(e.target.value), e.target.value);
        }}
        defaultValue={defaultValue}
      >
        {options.map((option, i) => (
          <option key={i}>{option}</option>
        ))}
      </select>
      {label && <p className="labelling">{label}</p>}
    </div>
  );
};

export default Selector;
