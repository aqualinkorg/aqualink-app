import React from 'react';
import { useDateContext } from '../../context/DateContext';
import MapView from './MapView';
import DatePicker from '../UI/DatePicker';

const MapContainer: React.FC = () => {
  const { selectedDate, setSelectedDate, isHistoricalView } = useDateContext();

  return (
    <div className="map-container relative w-full h-full">
      <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded-lg shadow-md flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-700">
          {isHistoricalView ? 'Viewing Historical Data' : 'Viewing Current Data'}
        </label>
        <DatePicker 
          value={selectedDate} 
          onChange={(date) => setSelectedDate(date)} 
        />
      </div>
      <MapView date={selectedDate} />
    </div>
  );
};

export default MapContainer;
