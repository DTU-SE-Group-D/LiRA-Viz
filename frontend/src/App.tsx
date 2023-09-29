import { FC } from 'react';
import { BrowserRouter as Router, Navigate } from 'react-router-dom';

import './App.css';
import { Route, Routes } from 'react-router-dom';
import RoadDetails from './pages/RoadDetails';

import Conditions from './pages/Conditions';

const App: FC = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route index element={<Navigate to="/map" replace />} />
          <Route path="/map" element={<Conditions />} />
          <Route path="/road-details" element={<RoadDetails />} />
        </Routes>
      </Router>
    </div>
  );
};
export default App;
