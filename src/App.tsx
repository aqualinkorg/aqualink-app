import React from 'react';
import { DateProvider } from './context/DateContext';
// ... outras importações

const App: React.FC = () => {
  return (
    <DateProvider>
      {/* Resto do App: Router, Providers, etc */}
      <div className="app-container">
        {/* ... */}
      </div>
    </DateProvider>
  );
};

export default App;
