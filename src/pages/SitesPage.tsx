import React, { useState } from 'react';
import { DateSelector } from '../components/Map/DateSelector';
import { SiteList } from '../components/Sites/SiteList';

export const SitesPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Environmental Sites</h1>
        <DateSelector 
          selectedDate={selectedDate} 
          onChange={setSelectedDate} 
        />
      </div>
      <SiteList date={selectedDate} />
    </div>
  );
};
