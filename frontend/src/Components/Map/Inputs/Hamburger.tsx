import React from 'react';
import '../../../css/Sidebar.css';

type Survey = {
  id: string;
  survey_id: string;
};

interface HamburgerProps {
  isOpen: boolean; // Whether the sidebar is open or not
  toggle: () => void;
  surveys: Survey[];
}

const Hamburger: React.FC<HamburgerProps> = ({ isOpen, toggle, surveys }) => {
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
          {surveys.map((survey) => (
            <div key={survey.id} className="survey-block">
              <h4>Survey ID: {survey.survey_id}</h4>
            </div>
          ))}
          <div className="survey-block">
            <h4>Survey Title 1</h4>
            <p>Some details about the survey...</p>
          </div>
          <div className="survey-block">
            <h4>Survey Title 2</h4>
            <p>Some details about the survey...</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hamburger;
