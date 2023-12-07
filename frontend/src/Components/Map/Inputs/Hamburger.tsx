import React, { useCallback, useEffect, useState } from 'react';
import '../../../css/Sidebar.css';
import { getAllSurveyData } from '../../../queries/conditions';
import { ISurvey, SurveyList } from '../../../../../backend/src/models';
import InfoCard from '../InfoCard';

interface HamburgerProps {
  /** Indicates if the sidebar is currently open. */
  isOpen: boolean;
  /** A function to open or close the sidebar. */
  toggle: () => void;
}

/**
 *A component representing a burger menu icon and sidebar. It handles the display
 * of a sidebar based on the 'isOpen' state, and toggles visibility with 'toggle'.
 *
 * @param {HamburgerProps} props - The properties passed to the hamburger component.
 * @returns {JSX.Element} A React functional component rendering the sidebar and the hamburger menu icon.
 *
 * @author Lyons
 */

const HEIGHT_OF_EACH_SURVEY_ITEM = 40; // Define this constant if not defined elsewhere

const Hamburger: React.FC<HamburgerProps> = ({ isOpen, toggle }) => {
  const [surveys, setSurveys] = useState<ISurvey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<ISurvey | null>(null);
  const [, setSelectedSurveyPosition] = useState<number>(0);

  useEffect(() => {
    getAllSurveyData((data: SurveyList) => {
      const transformedData: ISurvey[] = data.map((survey) => ({
        id: survey.id,
        timestamp: survey.timestamp,
        geometry: [],
        data: [],
      }));
      setSurveys(transformedData);
    });
  }, []);

  const handleSurveyClick = useCallback(
    (_surveyId: string, surveyIndex: number) => {
      setSelectedSurvey(surveys[surveyIndex]);
      const topPosition = surveyIndex * HEIGHT_OF_EACH_SURVEY_ITEM;
      setSelectedSurveyPosition(topPosition);
    },
    [surveys],
  );

  return (
    <>
      <div className="hamburger" onClick={toggle}>
        &#9776;
      </div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <a href="#!" className="closebtn" onClick={toggle}>
          &times;
        </a>
        <div className="sidebar-content">
          {surveys.map(
            (survey: { id: string; timestamp: string }, index: number) => (
              <div
                key={survey.id}
                className="survey-block"
                onClick={() => handleSurveyClick(survey.id, index)}
              >
                <h4>Survey {index + 1}</h4>
                <p>Date: {new Date(survey.timestamp).toLocaleDateString()}</p>
              </div>
            ),
          )}
        </div>
      </div>
      {selectedSurvey && (
        <InfoCard hidden={!isOpen} surveyData={selectedSurvey} />
      )}
    </>
  );
};

export default Hamburger;
