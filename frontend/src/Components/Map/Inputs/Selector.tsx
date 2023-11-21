import React from 'react';
import '../../../css/selector.css';
import { ImageType } from '../../../models/models';

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
        {Object.values(ImageType).map((imageType, i) =>
          options.includes(imageType.toString()) ? (
            <option key={i}>{imageType.toString()}</option>
          ) : (
            <option key={i} disabled={true}>
              {imageType.toString()}
            </option>
          ),
        )}
      </select>
      {label && <p className="labelling">{label}</p>}
    </div>
  );
};

export default Selector;
