// The TopBar for Inspect page
import React, { useCallback } from 'react';
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
  /** The available types for the road images */
  availableRoadImagesTypes: string[];
  /** The available types for the graph */
  availableGraphIndicatorType: string[];
}

/**
 * @author Muro
 */
const makeOnlyAvailableOptionsClickable = (
  options: { value: string; label: string }[],
  availableOptions: string[],
) => {
  const newOptions: {
    value: string;
    label: string;
    isDisabled?: boolean;
  }[] = [];

  //added ALL graph type
  newOptions.push({
    value: options[0].value,
    label: options[0].label,
  });

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

  const handleReturn = useCallback(() => {
    // Navigate back to the home page when the button is clicked
    navigate('/');
  }, [navigate]);

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
      <div className="graph-type-selector">
        <MultiSelector
          options={makeOnlyAvailableOptionsClickable(
            ConditionTypeOptions,
            availableGraphIndicatorType,
          )}
          placeholder="Condition Types"
          handleSelectionChange={(value: string[]) => {
            graphIndicatorSet(value);
          }}
          defaultValue={ConditionTypeOptions[0]}
          allowFullClear={false}
        ></MultiSelector>
      </div>
      <div className="road-image-selector">
        <Selector
          options={availableRoadImagesTypes}
          defaultValue={ImageType.ImageInt}
          onSelect={(_idx: number, selected: string) => {
            setSelectedType(selected);
          }}
          label={'Road Image Type'}
        />
      </div>
    </div>
  );
};

export default TopBar;
