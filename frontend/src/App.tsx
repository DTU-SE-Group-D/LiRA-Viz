import { FC } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import './App.css';
import Inspect from './pages/Inspect';

import Main from './pages/Main';

/**
 * Component rendering the whole application
 */
const App: FC = () => {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route index element={<Navigate to="/map" replace />} />
          <Route path="/map" element={<Main />} />
          <Route path="/road-details" element={<Inspect />} />
        </Routes>
      </Router>
    </div>
  );
};
export default App;
