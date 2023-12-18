import React, { useEffect, useRef, useState } from 'react';
import '../../../css/sidebar.css';
import { getAllSurveyData } from '../../../queries/conditions';
import { SurveyListItem } from '../../../models/models';

interface HamburgerProps {
  /** Indicates if the sidebar is currently open. */
  isOpen: boolean;
  /** A function to open or close the sidebar. */
  toggle: () => void;
  /** Callback to set the selected survey. */
  setSelectedSurvey: (survey: SurveyListItem) => void;
}

/**
 *A component representing a burger menu icon and sidebar. It handles the display
 * of a sidebar based on the 'isOpen' state, and toggles visibility with 'toggle'.
 *
 * @author Lyons, Kerbourc'h
 */
const Hamburger: React.FC<HamburgerProps> = ({
  isOpen,
  toggle,
  setSelectedSurvey,
}) => {
  const [surveys, setSurveys] = useState<SurveyListItem[]>([]);

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        let node = event.target as Node | null;
        let shouldCloseSidebar = true;

        while (node instanceof HTMLElement) {
          if (
            node.classList.contains('hamburger') ||
            node.classList.contains('inspect-button')
          ) {
            shouldCloseSidebar = false;
            break;
          }
          node = node.parentNode;
        }

        if (shouldCloseSidebar) {
          toggle();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggle]);

  useEffect(() => {
    getAllSurveyData((data: SurveyListItem[]) => {
      setSurveys(data);
    });
  }, []);

  const handleSurveyClick = (surveyIndex: number) => {
    setSelectedSurvey(surveys[surveyIndex]);
    toggle();
  };

  return (
    <>
      <div className="hamburger" onClick={toggle}>
        &#9776;
      </div>
      <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
        <a href="#!" className="closebtn" onClick={toggle}>
          &times;
        </a>
        <div className="sidebar-content">
          {surveys.map(
            (survey: { id: string; timestamp: string }, index: number) => (
              <div
                key={survey.id}
                className="survey-block"
                onClick={() => handleSurveyClick(index)}
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
