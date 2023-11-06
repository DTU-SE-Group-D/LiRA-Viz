import React, { useState } from 'react';
import '../../css/InfoButton.css';

/**
 * A small button showing information and instructions to use the webapp.
 */

const InfoButton: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);

  const handleInfoToggle = () => {
    setShowInfo(!showInfo);
  };

  return (
    <>
      <div className="info-button" onClick={handleInfoToggle}>
        !
      </div>
      <div className={`info-box ${showInfo ? 'visible' : ''}`}>
        <h3>Color Code Explanation:</h3>
        <p>
          <span className="color-code green"></span>Green: Good condition
        </p>
        <p>
          <span className="color-code yellow"></span>Yellow: Medium condition
        </p>
        <p>
          <span className="color-code red"></span>Red: Critical condition
        </p>
        <h3>User Help:</h3>
        <p>Click on a route to get detailed information.</p>
        <h3>Go to the Inspect Page:</h3>
        <ul>
          <li>Info appears upon selecting a road or survey from the list.</li>
          <li>Highlighted path on the map.</li>
          <li>
            "INSPECT" button appears on the top right for accessing the Inspect
            page.
          </li>
        </ul>
        <h3>Miscellaneous Features:</h3>
        <ul>
          <li>Hamburger button: Access survey list.</li>
        </ul>
      </div>
    </>
  );
};

export default InfoButton;
