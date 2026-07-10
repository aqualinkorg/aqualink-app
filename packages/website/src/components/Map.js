import React, { useState } from 'react';
import MapContainer from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Map = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mapData, setMapData] = useState([]);

  const fetchMapData = async (date) => {
    try {
      const response = await fetch(`/api/data?date=${date.toISOString()}`);
      const data = await response.json();
      setMapData(data);
    } catch (error) {
      console.error('Error fetching map data:', error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchMapData(date);
  };

  return (
    <div>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
      />
      <MapContainer
        initialViewState={{
          longitude: -122.4194,
          latitude: 37.7749,
          zoom: 9,
        }}
        style={{ width: '100%', height: '500px' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        {mapData.map((site) => (
          <div key={site.id} style={{ position: 'absolute', left: site.longitude, top: site.latitude }}>
            {site.name}
          </div>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
