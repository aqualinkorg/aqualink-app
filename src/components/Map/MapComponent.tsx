import React, { useState, useEffect } from 'react';
import { DateSelector } from './DateSelector';
// ... outras importações existentes (Map, Markers, etc)

export const MapComponent: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mapData, setMapData] = useState([]);

  useEffect(() => {
    fetchMapData(selectedDate);
  }, [selectedDate]);

  const fetchMapData = async (date: string) => {
    try {
      // Adicionando o parâmetro de data na query da API
      const response = await fetch(`/api/map-data?date=${date}`);
      const data = await response.json();
      setMapData(data);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  return (
    <div className="relative w-full h-full">
      <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      {/* Renderização do Mapa utilizando mapData */}
      <div id="map-container">
        {/* Lógica de renderização de markers baseada no mapData */}
      </div>
    </div>
  );
};
