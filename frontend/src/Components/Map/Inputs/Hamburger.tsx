import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/Sidebar.css';
import { getAllSurveyData } from '../../../queries/conditions';
//import { ISurvey } from '../../../backend/src/models.ts';

type Survey = {
  id: string;
  timestamp: string;
};

interface HamburgerProps {
  isOpen: boolean; // Whether the sidebar is open or not
  toggle: () => void;
  //surveys: Survey[];
}

const Hamburger: React.FC<HamburgerProps> = ({ isOpen, toggle }) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllSurveyData((data: Survey[]) => {
      console.log('Received survey data:', data);
      const formattedData = data.map((item) => ({
        id: item.id.toString(),
        timestamp: item.timestamp,
      }));
      setSurveys(formattedData);
    });
  }, []);

  const handleSurveyClick = (surveyId: string, _index: number) => {
    const type = ' ';
    const path = `/inspect/${type}/${surveyId}`;
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
          {surveys.map((survey, index) => (
            <div
              key={survey.id}
              className="survey-block"
              onClick={() => handleSurveyClick(survey.id, index + 1)}
            >
              <h4>Survey {index + 1}</h4>
              <p>Survey ID: {survey.id.slice(0, 7)}...</p>
              <p>Date: {new Date(survey.timestamp).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Hamburger;
