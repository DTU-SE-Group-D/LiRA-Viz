// The TopBar for Inspect page
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Selector from '../Map/Inputs/Selector';

import { ImageType } from '../../models/models'; // Import useNavigate
import MultiSelector from '../Map/Inputs/MultiSelector';
import { ConditionTypeOptions } from '../../models/conditions';

interface TopBarProps {
  /** Callback to set the selected type for roadimages*/
  setSelectedType: (type: string) => void;
  /** Callback to set the selected type for graph*/
  graphIndicatorSet: (type: string[]) => void;
  availableRoadImagesTypes: string[];
  availableGraphIndicatorType: string[];
}

const makeOnlyAvailableOptionsClickable = (
  options: { value: string; label: string }[],
  availableOptions: string[],
) => {
  const newOptions: {
    value: string;
    label: string;
    isDisabled?: boolean;
  }[] = [];

  availableOptions.forEach((availableOption: string) => {
    if (options.map((item) => item.value).includes(availableOption)) {
      newOptions.push({
        value: availableOption,
        label: availableOption,
      });
    }
  });
  return newOptions;
};

/**
 * The Topbar with return button and image type selector
 *
 * @param setSelectedType Callback to set the selected type
 * @param availableRoadImagesTypes The available types for the road images
 * @param graphIndicatorSet Callback to set the selected type for graph
 * @param availableGraphIndicatorType The available types for the graph
 * @author Chen, Hansen, Muro
 */
const TopBar: React.FC<TopBarProps> = ({
  setSelectedType,
  availableRoadImagesTypes,
  graphIndicatorSet,
  availableGraphIndicatorType,
}) => {
  const navigate = useNavigate(); // Get the navigate function

  const handleReturn = () => {
    // Navigate back to the home page when the button is clicked
    navigate('/');
  };

  return (
    <div className="top-bar topBar-container ">
      <Link to="/" onClick={handleReturn} className="btnLinkContainer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="btn bi bi-chevron-left btnWhite"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
          />
        </svg>
      </Link>
      <Selector
        className="road-image-selector"
        options={availableRoadImagesTypes}
        defaultValue={ImageType.ImageInt}
        onSelect={(_idx: number, selected: string) => {
          setSelectedType(selected);
        }}
        label={'Road Image Type'}
      />
      <MultiSelector
        options={makeOnlyAvailableOptionsClickable(
          ConditionTypeOptions,
          availableGraphIndicatorType,
        )}
        placeholder="Condition Types"
        handleSelectionChange={(value: string[]) => {
          graphIndicatorSet(value);
        }}
        // defaultValue={availableGraphIndicatorType[0]}
      ></MultiSelector>
    </div>
  );
};

export default TopBar;
