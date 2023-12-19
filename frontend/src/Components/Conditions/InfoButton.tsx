import React, { useCallback, useEffect, useRef, useState } from 'react';
import '../../css/infobutton.css';

/**
 * A small button showing information and instructions to use the webapp.
 *
 * @author Lyons, Chen, Muro
 */
const InfoButton: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);
  const infoButtonRef = useRef<HTMLDivElement>(null);

  // Toggle the visibility of the info box

  const handleInfoToggle = useCallback(() => {
    setShowInfo(!showInfo);
  }, [showInfo]);

  // Close the info box if clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      infoButtonRef.current &&
      !infoButtonRef.current.contains(event.target as Node)
    ) {
      setShowInfo(false);
    }
  }, []);

  useEffect(() => {
    // Add event listener for the click when the component is mounted
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Stop the propagation of the click event to prevent handleClickOutside from being triggered
  const stopPropagation = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <>
      <div className="info-button" onClick={handleInfoToggle}>
        i
      </div>
      {showInfo && (
        <div
          className="info-box visible"
          ref={infoButtonRef}
          onClick={stopPropagation} // This stops the click event from closing the info box
        >
          <h3 className="infotitle">Color Code Explanation</h3>
          <h4>Condition Types</h4>
          <div className="color-explanation">
            <div className="color-detail">
              <span className="color-code red"></span>
              <p>KPI</p>
            </div>
            <div className="color-detail">
              <span className="color-code green"></span>
              <p>DI</p>
            </div>
            <div className="color-detail">
              <span className="color-code yellow"></span>
              <p>IRI</p>
            </div>
            <div className="color-detail">
              <span className="color-code muBlue"></span>
              <p>Mu</p>
            </div>
            <div className="color-detail">
              <span className="color-code eNorm"></span>
              <p>E_norm</p>
            </div>
          </div>
          <h4>Severity Types</h4>
          <ul>
            <li>
              Given the selected road parameters, these can be further filtered
              out by choosing the severity. The color coding changes, and only
              the selected parameters with the desired road severity will show.
            </li>
          </ul>
          <div className="color-explanation">
            <div className="color-detail">
              <span className="color-code low"></span>
              <p>low</p>
            </div>
            <div className="color-detail">
              <span className="color-code medium"></span>
              <p>medium</p>
            </div>
            <div className="color-detail">
              <span className="color-code high"></span>
              <p>high</p>
            </div>
            <div className="color-detail">
              <span className="color-code critical"></span>
              <p>critical</p>
            </div>
          </div>
          <h3>User Help</h3>
          <ul>
            <li>
              Click on a route or search a road to get detailed information
            </li>
            <li>
              Access survey list by Hamburger button in the top left corner
            </li>
          </ul>
          <h3>Go to the Inspect Page</h3>
          <ul>
            <li>Info Card appears upon selecting a road or survey</li>
            <li>Highlighted path on the map</li>
            <li>
              "INSPECT" button is in Info Card for accessing the Inspect page
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default InfoButton;
