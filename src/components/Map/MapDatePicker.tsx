import React from 'react';
import { useDateContext } from '../../context/DateContext';

export const MapDatePicker: React.FC = () => {
  const { selectedDate, setSelectedDate, isHistoricalView, resetToToday } = useDateContext();

  return (
    <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded-lg shadow-md flex flex-col gap-2">
      <label className="text-sm font-bold text-gray-700">View Date</label>
      <input 
        type="date" 
        value={selectedDate.toISOString().split('T')[0]} 
        onChange={(e) => setSelectedDate(new Date(e.target.value))}
        className="border p-1 rounded"
      />
      {isHistoricalView && (
        <button 
          onClick={resetToToday}
          className="text-xs text-blue-600 hover:underline"
        >
          Return to Today
        </button>
      )}
    </div>
  );
};
