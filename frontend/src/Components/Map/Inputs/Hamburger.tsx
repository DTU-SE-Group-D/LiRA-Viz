import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/Sidebar.css';
import { getAllSurveyData } from '../../../queries/conditions';
import { SurveyList } from '../../../../../backend/src/models';

/**
 * Defines the properties for the Hamburger component, which include the state of the sidebar
 * and a function to toggle its visibility.
 *
 * @property {boolean} isOpen Indicates if the sidebar is currently open.
 * @property {Function} toggle A function to open or close the sidebar.
 *
 * @author Lyons
 */
interface HamburgerProps {
  isOpen: boolean; // Whether the sidebar is open or not
  toggle: () => void;
  //surveys: Survey[];
}

/**
 *A component representing a burger menu icon and sidebar. It handles the display
 * of a sidebar based on the 'isOpen' state, and toggles visibility with 'toggle'.
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
