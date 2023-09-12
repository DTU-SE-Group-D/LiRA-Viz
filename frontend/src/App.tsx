import { FC } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import Navbar from './Components/Navbar';
import RoadConditions from './pages/RoadConditions';
import Conditions from './pages/Conditions';

import './App.css';

const App: FC = () => {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route index element={<Navigate to="/conditions" replace />} />
          <Route path="/conditions" Component={Conditions} />
          <Route path="/road_conditions" Component={RoadConditions} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
