// The TopBar for RoadDetails page
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

const return_btn = (
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
);

/**
 * The Topbar with return and toggle button inside
 */
const TopBar: React.FC = () => {
  const navigate = useNavigate(); // Get the navigate function

  const handleReturn = () => {
    // Navigate back to the home page when the button is clicked
    navigate('/');
  };

  return (
    <div className="top-bar topBar-container ">
      <Link to="/" onClick={handleReturn} className="btnLinkContainer">
        {return_btn}
      </Link>
    </div>
  );
};

export default TopBar;
