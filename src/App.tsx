import React from 'react';
import { DateProvider } from './context/DateContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapContainer from './components/Map/MapContainer';
import Sites from './pages/Sites';

const App: React.FC = () => {
  return (
    <DateProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MapContainer />} />
          <Route path="/sites" element={<Sites />} />
        </Routes>
      </Router>
    </DateProvider>
  );
};

export default App;
