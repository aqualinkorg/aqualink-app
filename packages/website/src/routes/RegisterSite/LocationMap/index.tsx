import React, { useCallback, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L, { LeafletEvent } from 'leaflet';
import { Theme } from '@mui/material';

import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

import { mapConstants } from 'constants/maps';
import marker from '../../../assets/marker.png';

const pinIcon = L.icon({
  iconUrl: marker,
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -41],
});

const INITIAL_ZOOM = 5;

function MapEventsHandler({
  updateLatLng,
  setZoom,
}: {
  updateLatLng: (event: L.LeafletMouseEvent) => void;
  setZoom: (event: LeafletEvent) => void;
}) {
  useMapEvents({
    click: updateLatLng,
    zoomend: setZoom,
  });
  return null;
}

function LocationMap({
  markerPositionLat,
  markerPositionLng,
  updateMarkerPosition,
  classes,
}: LocationMapProps) {
  const [zoom, setZoom] = useState<number>(INITIAL_ZOOM);

  const onZoomEnd = useCallback(
    (event: LeafletEvent) => setZoom(event.target._zoom as number),
    [],
  );

  function updateLatLng(event: L.LeafletMouseEvent) {
    const { lat, lng } = event.latlng.wrap();
    updateMarkerPosition([lat, lng]);
  }

  function parseCoordinates(coord: string, defaultValue: number) {
    const parsed = parseFloat(coord);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }

  const markerPosition: L.LatLngTuple = [
    parseCoordinates(markerPositionLat, 37.773972),
    parseCoordinates(markerPositionLng, -122.431297),
  ];

  return (
    <MapContainer
      center={markerPosition}
      zoom={zoom}
      className={classes.map}
      maxBounds={mapConstants.MAX_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={1}
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      {markerPosition && <Marker icon={pinIcon} position={markerPosition} />}
      <MapEventsHandler
        updateLatLng={(e) => updateLatLng(e)}
        setZoom={(e) => onZoomEnd(e)}
      />
    </MapContainer>
  );
}

const styles = (theme: Theme) =>
  createStyles({
    map: {
      height: '100%',
      width: '100%',
      borderRadius: 4,
      cursor: 'pointer',

      [theme.breakpoints.down('lg')]: {
        height: 400,
      },
    },
  });

export interface LocationMapProps extends WithStyles<typeof styles> {
  markerPositionLat: string;
  markerPositionLng: string;
  updateMarkerPosition(tuple: L.LatLngTuple): void;
}

export default withStyles(styles)(LocationMap);
