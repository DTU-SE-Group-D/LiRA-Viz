import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/roadinfo_card.css';
import { IRoad } from '../../models/path';

interface Props {
  /** To control visibility */
  hidden: boolean;
  /** The road data to display */
  roadData?: IRoad;
}
/**
 * A components that renders the info card when users click on a road with data
 *
 * @author Chen
 */
const InfoCard: React.FC<Props> = ({ hidden, roadData }) => {
  const navigate = useNavigate(); // Get the navigate function

  // Navigate to the "Inspect" page
  const handleInspect = useCallback(() => {
    if (!roadData) return;
    const biggestBranch = roadData?.branches.reduce((prev, curr) =>
      prev.length > curr.length ? prev : curr,
    );

    navigate('/inspect/paths/' + biggestBranch.join(','));
  }, [roadData, navigate]);

  if (hidden || !roadData) {
    return null; // Don't render anything if hidden is true
  }

  return (
    <div className="roadinfo-card-content">
      <div className="roadinfo-text-container">
        <div className="roadinfo-card-text">
          <span className="text-title">Road Name:</span>{' '}
          <span className="card-road-name">{roadData.way_name}</span>
        </div>
        <div className="roadinfo-card-text">
          <span className="text-title"> Branch Number: </span>
          <span className="card-road-length"> {roadData.branches.length} </span>
        </div>
      </div>

      <button onClick={handleInspect} className="inspect-button">
        Inspect
      </button>
    </div>
  );
};

export default InfoCard;
