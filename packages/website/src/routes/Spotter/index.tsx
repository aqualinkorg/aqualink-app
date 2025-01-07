import React, { useState, useEffect } from 'react';
import {
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { TileLayer, Marker, Polyline, MapContainer } from 'react-leaflet';
import L from 'leaflet';

import {
  getCompassDirection,
  getDistance,
  getGreatCircleBearing,
} from 'geolib';
import LocateControl from './locate';
import marker from '../../assets/marker.png';

// How many hours of data to show
const nHours = 12;

type BuoyData = {
  [key: string]: { id: string; name: string };
};

type WaveData = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

const pinIcon = L.icon({
  iconUrl: marker,
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -41],
});

type BuoySelectorProps = {
  buoyData: BuoyData | undefined;
  token: string | undefined;
  selectedBuoy: { id: string; name: string } | undefined;
  handleBuoyClick: (buoyId: string) => void;
};

const BuoySelector = ({
  buoyData,
  token,
  selectedBuoy,
  handleBuoyClick,
}: BuoySelectorProps) => {
  if (!token) {
    return null;
  }

  if (!buoyData) {
    return <Typography>No Spotters available for token {token}</Typography>;
  }

  return (
    <Grid item xs={12} md={6} style={{ height: '2em' }}>
      <Typography>Available spotters</Typography>
      <Select
        variant="standard"
        value={selectedBuoy?.id || ''}
        onChange={(event) => handleBuoyClick(event.target.value as string)}
        style={{ color: 'black', width: '200px' }}
      >
        {Object.keys(buoyData).map((buoyId) => (
          <MenuItem key={buoyId} value={buoyId} style={{ color: 'black' }}>
            {buoyId} - {buoyData[buoyId].name}
          </MenuItem>
        ))}
      </Select>
      {selectedBuoy && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            handleBuoyClick(selectedBuoy?.id as string);
          }}
          style={{ marginLeft: '1em', width: 'auto' }}
        >
          Refresh
        </Button>
      )}
    </Grid>
  );
};

type BuoyContentProps = {
  selectedBuoy: { id: string; name: string } | undefined;
  waveData: WaveData[];
  userLocation: { lat: number; lng: number } | undefined;
};

const BuoyContent = ({
  selectedBuoy,
  waveData,
  userLocation,
}: BuoyContentProps) => {
  if (!selectedBuoy) {
    return (
      <div style={{ paddingTop: '1em', paddingLeft: '1em' }}>
        Please input a token and select a spotter
      </div>
    );
  }
  if (waveData?.length > 0) {
    const lastPosition = waveData[waveData.length - 1];

    const distance =
      (userLocation &&
        lastPosition &&
        getDistance(userLocation, lastPosition)) ||
      0;

    const heading =
      (userLocation &&
        lastPosition &&
        getGreatCircleBearing(userLocation, lastPosition)) ||
      0;

    const compass =
      (userLocation &&
        lastPosition &&
        getCompassDirection(userLocation, lastPosition)) ||
      'NA';

    return (
      <>
        <div style={{ paddingTop: '1em', paddingLeft: '1em', height: '6em' }}>
          {selectedBuoy.id} last seen at{' '}
          {new Date(lastPosition.timestamp).toLocaleString()}
          <br />
          Latitude: {lastPosition.latitude}, Longitude: {lastPosition.longitude}
          <br />
          Distance: {distance.toFixed(0)} m, Heading: {heading.toFixed(0)}{' '}
          degrees ({compass})
        </div>
        <MapContainer
          key={0}
          center={{ lat: lastPosition.latitude, lng: lastPosition.longitude }}
          zoom={13}
          style={{ width: '100%', height: 'calc(100% - 8em)' }}
        >
          <LocateControl />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}@2x"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {waveData.map((wave) => (
            <Marker
              icon={pinIcon}
              key={`${wave.latitude} ${wave.timestamp}`}
              position={{ lat: wave.latitude, lng: wave.longitude }}
            />
          ))}
          <Polyline
            positions={waveData.map((wave) => [wave.latitude, wave.longitude])}
          />
        </MapContainer>
      </>
    );
  }
  return (
    <div style={{ paddingTop: '1em', paddingLeft: '1em' }}>
      No data available in the past {nHours} hours for{' '}
      {selectedBuoy.name || selectedBuoy.id}
    </div>
  );
};

const BuoyPage = () => {
  // Get token from localStorage or use default
  const initialToken = localStorage.getItem('token') || undefined;
  const initialSelectedBuoy = JSON.parse(
    localStorage.getItem('selectedBuoy') || 'null',
  );
  const [buoyData, setBuoyData] = useState<BuoyData | undefined>(undefined);
  const [selectedBuoy, setSelectedBuoy] = useState<any>(
    initialSelectedBuoy || undefined,
  );
  const [waveData, setWaveData] = useState<WaveData[]>([]);
  const [userLocation, setUserLocation] = useState<any>(undefined);
  const [token, setToken] = useState<string | undefined>(initialToken);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }, []);

  useEffect(() => {
    fetch(`https://api.sofarocean.com/api/devices?token=${token}`)
      .then((response) => response.json())
      .then((data) => {
        const buoys = data?.data?.devices.reduce(
          (acc: BuoyData, device: any) => {
            return {
              ...acc,
              [device.spotterId]: {
                id: device.spotterId,
                name: device.name,
              },
            };
          },
          {},
        );
        // only save token if we successfully get buoy data
        if (buoys) {
          localStorage.setItem('token', token || '');
        }
        setBuoyData(buoys);
      });
  }, [token]);

  const handleBuoyClick = (buoyId: string) => {
    if (!buoyData || !buoyData[buoyId]) {
      return;
    }
    fetch(
      `https://api.sofarocean.com/api/wave-data?spotterId=${buoyId}&includeTrack=true&token=${token}&limit=200`,
    )
      .then((response) => response.json())
      .then((data) => {
        const twoHoursAgo = new Date().getTime() - nHours * 60 * 60 * 1000; // Current time minus 2 hours in milliseconds
        const filteredWaveData = data.data.track?.filter((wave: WaveData) => {
          const waveTime = new Date(wave.timestamp).getTime();
          return waveTime >= twoHoursAgo;
        });
        setWaveData(filteredWaveData);
        const newSelectedBuoy = buoyData[buoyId];
        setSelectedBuoy(newSelectedBuoy);
        localStorage.setItem('selectedBuoy', JSON.stringify(newSelectedBuoy));
      });
  };

  useEffect(() => {
    if (initialSelectedBuoy) {
      handleBuoyClick(initialSelectedBuoy.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buoyData]);

  return (
    <Grid container style={{ height: '100%' }}>
      <Grid container style={{ padding: '1em' }}>
        <Grid item xs={12} md={6}>
          <Typography>Enter your Sofar API Token</Typography>
          <TextField
            value={token}
            onChange={handleTokenChange}
            placeholder="XXXX-XXX-XXXX-XXX"
            variant="outlined"
            size="small"
            style={{ width: '300px' }}
          />
        </Grid>
        <BuoySelector
          buoyData={buoyData}
          token={token}
          selectedBuoy={selectedBuoy}
          handleBuoyClick={handleBuoyClick}
        />
      </Grid>
      <Grid item xs={12} style={{ minHeight: 'calc(100% - 9em)' }}>
        <BuoyContent
          selectedBuoy={selectedBuoy}
          waveData={waveData}
          userLocation={userLocation}
        />
      </Grid>
    </Grid>
  );
};

export default BuoyPage;
