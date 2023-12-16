import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/roadinfo_card.css';
import { IRoad } from '../../models/path';
import { SurveyListItem } from '../../models/models';

interface Props {
  /** To control visibility */
  hidden: boolean;
  /** The road data to display */
  roadData?: IRoad;
  /** The survey data to display */
  surveyData?: SurveyListItem;
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
        state: {
          name: `${surveyData.dynatest_id} (${new Date(
            surveyData.timestamp,
          ).toLocaleDateString()})`,
        },
      });
    }
  }, [roadData, surveyData, navigate]);

  if (hidden || (!roadData && !surveyData)) {
    return null;
  }

  return (
    <div className="roadinfo-card-content">
      <div className="roadinfo-text-container">
        <div className="roadinfo-card-text">
          <span className="text-title">
            {roadData ? 'Road Name:' : 'Dynatest survey id:'}
          </span>{' '}
          <span className="card-road-name">
            {roadData ? roadData.way_name : surveyData!.dynatest_id}
          </span>
        </div>
        <div className="roadinfo-card-text">
          <span className="text-title">
            {roadData ? 'Branch Number:' : 'Date: '}
          </span>
          <span className="card-road-length">
            {roadData
              ? roadData.branches.length
              : new Date(surveyData!.timestamp).toLocaleDateString()}
          </span>
        </div>
      </div>
      <button onClick={handleInspect} className="inspect-button">
        Inspect
      </button>
    </div>
  );
};

export default InfoCard;
