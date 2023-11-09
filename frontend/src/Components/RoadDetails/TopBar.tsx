// The TopBar for Inspect page
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Selector from '../Map/Inputs/Selector';
import { ImageType } from '../../models/path'; // Import useNavigate

interface TopBarProps {
  /** Callback to set the selected type */
  setSelectedType: (type: string) => void;
}

/**
 * The Topbar with return and toggle button inside
 *
 * @author Chen
 */
const TopBar: React.FC<TopBarProps> = ({ setSelectedType }) => {
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
        options={[
          ImageType.Image3D,
          ImageType.ImageInt,
          ImageType.ImageRng,
          ImageType.OverlayRng,
          ImageType.Overlay3D,
          ImageType.OverlayInt,
        ]}
        defaultValue={ImageType.ImageInt}
        onSelect={(_idx: number, selected: string) => {
          setSelectedType(selected);
        }}
        label={'Road surface image type'}
      />
    </div>
  );
};

export default TopBar;
