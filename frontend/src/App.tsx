import { FC } from 'react';
// import { BrowserRouter as Router, Route } from 'react-router-dom';
import Conditions from './pages/Conditions';

import './App.css';
import RoadConditions from './pages/RoadConditions';

const App: FC = () => {
  return (
    <div className="App">
      <Conditions />
      <RoadConditions />
    </div>
  );
};

export default App;
