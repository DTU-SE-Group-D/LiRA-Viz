import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/Sidebar.css';
import { getAllSurveyData } from '../../../queries/conditions';
import { SurveyList } from '../../../../../backend/src/models';

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
const Hamburger: React.FC<HamburgerProps> = ({ isOpen, toggle }) => {
  const [surveys, setSurveys] = useState<SurveyList>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllSurveyData((data: SurveyList) => {
      console.log('Received survey data:', data);
      setSurveys(data);
    });
  }, []);

  const handleSurveyClick = (surveyId: string, _index: number) => {
    const path = `/inspect/surveys/${surveyId}`;
    navigate(path);
  };

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
                onClick={() => handleSurveyClick(survey.id, index + 1)}
              >
                <h4>Survey {index + 1}</h4>
                <p>Date: {new Date(survey.timestamp).toLocaleDateString()}</p>
              </div>
            ),
          )}
        </div>
      </div>
    </>
  );
};

export default Hamburger;
