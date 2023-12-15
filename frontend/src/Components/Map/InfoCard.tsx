import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/roadinfo_card.css';
import { IRoad } from '../../models/path';
import { ISurvey } from '../../../../backend/src/models';

interface Props {
  /** To control visibility */
  hidden: boolean;
  /** The road data to display */
  roadData?: IRoad;
  /** The survey data to display */
  surveyData?: ISurvey;
}
/**
 * A components that renders the info card when users click on a road with data
 * Additionally, when selecting a survey, an info card will appear with survey ID & timestamp
 * @author Chen, Lyons
 */
const InfoCard: React.FC<Props> = ({ hidden, roadData, surveyData }) => {
  const navigate = useNavigate(); // Get the navigate function

  const handleInspect = useCallback(() => {
    // Determine whether to navigate to road or survey inspect page
    if (roadData) {
      const biggestBranch = roadData.branches.reduce((prev, curr) =>
        prev.length > curr.length ? prev : curr,
      );
      navigate('/inspect/paths/' + biggestBranch.join(','), {
        state: { name: roadData.way_name },
      });
    } else if (surveyData) {
      navigate(`/inspect/surveys/${surveyData.id}`, {
        state: { name: new Date(surveyData.timestamp).toLocaleDateString() },
      });
    }
  }, [roadData, surveyData, navigate]);

  if (hidden || (!roadData && !surveyData)) {
    return null;
  }

  return (
    <div className="roadinfo-card-content">
      {roadData && (
        <div className="roadinfo-text-container">
          <div className="roadinfo-card-text">
            <span className="text-title">Road Name:</span>{' '}
            <span className="card-road-name">{roadData.way_name}</span>
          </div>
          <div className="roadinfo-card-text">
            <span className="text-title"> Branch Number: </span>
            <span className="card-road-length">{roadData.branches.length}</span>
          </div>
        </div>
      )}
      {surveyData && (
        <div className="roadinfo-text-container">
          <div className="roadinfo-card-text">
            <span className="text-title">Survey ID:</span>
            <span className="card-road-name">{surveyData.id}</span>
          </div>
          <div className="roadinfo-card-text">
            <span className="text-title">Last updated:</span>
            <span className="card-road-length">
              {new Date(surveyData.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
      <button onClick={handleInspect} className="inspect-button">
        Inspect
      </button>
    </div>
  );
};

export default InfoCard;
