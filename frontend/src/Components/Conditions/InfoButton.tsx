import React, { useState } from 'react';
import '../../css/InfoButton.css';

const InfoButton: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);

  const handleInfoToggle = () => {
    setShowInfo(!showInfo);
  };

  const scrollToBottom = () => {
    const infoBoxElement = document.querySelector('.info-box');
    if (infoBoxElement) {
      infoBoxElement.scrollTo({
        top: infoBoxElement.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      <div className="info-button" onClick={handleInfoToggle}>
        !
      </div>
      <div className={`info-box ${showInfo ? 'visible' : ''}`}>
        <h2>Color Code Explanation:</h2>
        <p>
          <span className="color-code green"></span>Green: Good condition
        </p>
        <p>
          <span className="color-code yellow"></span>Yellow: Medium condition
        </p>
        <p>
          <span className="color-code red"></span>Red: Critical condition
        </p>
        <h2>User Help:</h2>
        <p>Click on a route to get detailed information.</p>
        <h2>Interactive Map:</h2>
        <ul>
          <li>Zoom in/out for detailed views.</li>
          <li>Pan to navigate.</li>
          <li>Click data points to access the Inspect page.</li>
        </ul>
        <h2>Top Bar Features:</h2>
        <h4>Left:</h4>
        <ul>
          <li>Road search box: Find roads by name.</li>
          <li>Date filter: Narrow down data by specific dates.</li>
        </ul>
        <h4>Center:</h4>
        <ul>
          <li>Condition indicator selector (KPI, DI, IRI, Mu, E_norm).</li>
        </ul>
        <h4>Right:</h4>
        <ul>
          <li>Button for uploading new road data.</li>
        </ul>
        <h3>Inspection Status:</h3>
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
          <li>Hamburger button: Access survey list, sorted by recency.</li>
          <li>
            Info button (bottom-right): Get color code explanations, user help,
            and more.
          </li>
        </ul>
        <div className="scroll-btn down" onClick={scrollToBottom}>
          ⬇️
        </div>
      </div>
    </>
  );
};

export default InfoButton;
