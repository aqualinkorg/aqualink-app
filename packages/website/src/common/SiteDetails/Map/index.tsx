import React, { useRef, useEffect, useCallback, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import L, { LatLngTuple } from 'leaflet';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { some } from 'lodash';

import { mapConstants } from 'constants/maps';
import {
  Site,
  Position,
  SpotterPosition,
  SurveyPoints,
  Point,
} from 'store/Sites/types';
import { siteDraftSelector, setSiteDraft } from 'store/Sites/selectedSiteSlice';
import { userInfoSelector } from 'store/User/userSlice';
import { samePosition } from 'helpers/map';
import { isManager } from 'helpers/user';
import SurveyPointPopup from './SurveyPointPopup';

import marker from '../../../assets/marker.png';
import buoy from '../../../assets/buoy-marker.svg';
import pointIcon from '../../../assets/alerts/pin_nostress@2x.png';
import selectedPointIcon from '../../../assets/alerts/pin_warning@2x.png';

const pinIcon = L.icon({
  iconUrl: marker,
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -41],
});

const buoyIcon = L.icon({
  iconUrl: buoy,
  iconSize: [30, 40],
  iconAnchor: [10, 30],
  popupAnchor: [0, -41],
});

const surveyPointIcon = (selected: boolean) =>
  L.icon({
    iconUrl: selected ? selectedPointIcon : pointIcon,
    iconSize: [24, 27],
    iconAnchor: [12, 27],
    popupAnchor: [0, -27],
  });

const SiteMap = ({
  siteId,
  spotterPosition = null,
  polygon,
  surveyPoints,
  selectedPointId = 0,
  surveyPointEditModeEnabled = false,
  editPointLatitude = null,
  editPointLongitude = null,
  onEditPointCoordinatesChange = () => {},
  classes,
}: SiteMapProps) => {
  const dispatch = useDispatch();
  const mapRef = useRef<L.Map>(null);
  const markerRef = useRef<L.Marker>(null);
  const editPointMarkerRer = useRef<L.Marker>(null);
  const draftSite = useSelector(siteDraftSelector);
  const user = useSelector(userInfoSelector);
  const [focusedPoint, setFocusedPoint] = useState<SurveyPoints>();

  const reverseCoords = (coordArray: Position[]): [Position[]] => {
    return [coordArray.map((coords) => [coords[1], coords[0]])];
  };

  const selectedSurveyPoint = surveyPoints.find(
    (item) => item.id === selectedPointId,
  );

  const setCenter = (
    inputMap: L.Map,
    latLng: [number, number],
    zoom: number,
  ) => {
    const maxZoom = Math.max(inputMap.getZoom() || 15, zoom);
    const pointBounds = L.latLngBounds(latLng, latLng);
    inputMap.flyToBounds(pointBounds, {
      maxZoom,
      duration: 2,
      paddingTopLeft: L.point(0, 200),
    });
  };

  // Fit the polygon constructed by the site's center and its survey points
  const fitSurveyPointsPolygon = useCallback(
    (inputMap: L.Map, siteCenter: Point) => {
      inputMap.fitBounds(
        L.polygon([
          [siteCenter.coordinates[1], siteCenter.coordinates[0]],
          ...surveyPoints
            .filter((item) => item.polygon?.type === 'Point')
            .map((item) => {
              const coords = item.polygon?.coordinates as Position;
              // Reverse coordinates since they come as [lng, lat]
              return [coords[1], coords[0]] as LatLngTuple;
            }),
        ]).getBounds(),
      );
    },
    [surveyPoints],
  );

  useEffect(() => {
    if (mapRef?.current && focusedPoint?.polygon?.type === 'Point') {
      const [lng, lat] = focusedPoint.polygon.coordinates;
      setCenter(mapRef.current, [lat, lng], 15);
    }
  }, [focusedPoint]);

  useEffect(() => {
    const { current } = mapRef;
    if (current) {
      const map = current;
      // Initialize map's position to fit the given polygon
      if (polygon.type === 'Polygon') {
        map.fitBounds(L.polygon(polygon.coordinates).getBounds());
      } else if (draftSite?.coordinates) {
        map.panTo(
          new L.LatLng(
            draftSite.coordinates.latitude || polygon.coordinates[1],
            draftSite.coordinates.longitude || polygon.coordinates[0],
          ),
        );
      } else if (some(surveyPoints, (item) => item.polygon?.type === 'Point')) {
        fitSurveyPointsPolygon(map, polygon);
      } else {
        map.panTo(new L.LatLng(polygon.coordinates[1], polygon.coordinates[0]));
      }
    }
  }, [draftSite, fitSurveyPointsPolygon, polygon, surveyPoints]);

  const handleDragChange = () => {
    const { current } = markerRef;
    if (current) {
      const mapMarker = current;
      const { lat, lng } = mapMarker.getLatLng().wrap();
      dispatch(
        setSiteDraft({
          coordinates: {
            latitude: lat,
            longitude: lng,
          },
        }),
      );
    }
  };

  const handleEditPointDragChange = () => {
    const { current } = editPointMarkerRer;
    if (current && onEditPointCoordinatesChange) {
      const mapMarker = current;
      const { lat, lng } = mapMarker.getLatLng().wrap();
      onEditPointCoordinatesChange(lat.toString(), lng.toString());
    }
  };

  return (
    <MapContainer
      ref={mapRef}
      center={
        polygon.type === 'Polygon'
          ? [0, 0]
          : [polygon.coordinates[1], polygon.coordinates[0]]
      }
      minZoom={1}
      maxZoom={17}
      zoom={13}
      dragging
      scrollWheelZoom={false}
      className={classes.map}
      tap={false}
      maxBoundsViscosity={1.0}
      maxBounds={mapConstants.MAX_BOUNDS}
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      {polygon.type === 'Polygon' ? (
        <Polygon positions={reverseCoords(...polygon.coordinates)} />
      ) : (
        <>
          {/* Marker to listen to survey point drag changes on edit mode */}
          {surveyPointEditModeEnabled && (
            <Marker
              ref={editPointMarkerRer}
              draggable={surveyPointEditModeEnabled}
              eventHandlers={{
                dragend: handleEditPointDragChange,
              }}
              icon={surveyPointIcon(true)}
              zIndexOffset={100}
              position={[
                editPointLatitude ||
                  (selectedSurveyPoint?.polygon?.type === 'Point' &&
                    selectedSurveyPoint.polygon.coordinates[1]) ||
                  polygon.coordinates[1],
                editPointLongitude ||
                  (selectedSurveyPoint?.polygon?.type === 'Point' &&
                    selectedSurveyPoint.polygon.coordinates[0]) ||
                  polygon.coordinates[0],
              ]}
            />
          )}
          <Marker
            ref={markerRef}
            draggable={Boolean(draftSite)}
            eventHandlers={{
              dragend: handleDragChange,
            }}
            icon={pinIcon}
            position={[
              draftSite?.coordinates?.latitude || polygon.coordinates[1],
              draftSite?.coordinates?.longitude || polygon.coordinates[0],
            ]}
          />
          {surveyPoints.map(
            (point) =>
              point?.polygon?.type === 'Point' &&
              !samePosition(polygon, point.polygon) &&
              (point.id !== selectedPointId || !surveyPointEditModeEnabled) && ( // Hide selected survey point marker if it is in edit mode
                <Marker
                  key={point.id}
                  icon={surveyPointIcon(point.id === selectedPointId)}
                  position={[
                    point.polygon.coordinates[1],
                    point.polygon.coordinates[0],
                  ]}
                  eventHandlers={{
                    click: () => setFocusedPoint(point),
                  }}
                >
                  <SurveyPointPopup siteId={siteId} point={point} />
                </Marker>
              ),
          )}
        </>
      )}
      {!draftSite && spotterPosition && isManager(user) && (
        <Marker
          icon={buoyIcon}
          position={[spotterPosition.latitude, spotterPosition.longitude]}
        />
      )}
    </MapContainer>
  );
};

const styles = () => {
  return createStyles({
    map: {
      height: '100%',
      width: '100%',
      borderRadius: 4,
    },
  });
};

interface SiteMapIncomingProps {
  siteId: number;
  polygon: Site['polygon'];
  spotterPosition?: SpotterPosition | null;
  surveyPoints: SurveyPoints[];
  selectedPointId?: number;
  surveyPointEditModeEnabled?: boolean;
  editPointLatitude?: number | null;
  editPointLongitude?: number | null;
  onEditPointCoordinatesChange?: (lat: string, lng: string) => void;
}

type SiteMapProps = WithStyles<typeof styles> & SiteMapIncomingProps;

export default withStyles(styles)(SiteMap);
