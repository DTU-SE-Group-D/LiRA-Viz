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
import Test from './pages/Test';

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
          <Route path="/inspect" element={<Inspect />} />
          <Route path="/test" element={<Test />} />
          <Route path="/inspect/:type" element={<Inspect />} />
          <Route path="/inspect/:type/:id" element={<Inspect />} />
        </Routes>
      </Router>
    </div>
  );
};
export default App;
