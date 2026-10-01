import React, { useState, useEffect } from 'react';
import { DateSelector } from './DateSelector';
// Assumindo a existência de hooks de dados e componentes de mapa
import { useEnvironmentalData } from '../../hooks/useEnvironmentalData'; 
import MapView from './MapView';

export const MapComponent: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // O hook de dados agora recebe a data para filtrar os resultados do backend
  const { data, loading, error } = useEnvironmentalData(selectedDate);

  return (
    <div className="relative w-full h-full">
      <DateSelector 
        selectedDate={selectedDate} 
        onChange={setSelectedDate} 
      />
      <MapView 
        data={data} 
        isLoading={loading} 
        error={error} 
      />
    </div>
  );
};
