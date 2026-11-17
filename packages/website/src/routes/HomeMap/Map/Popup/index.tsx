import React, { useEffect, useRef } from 'react';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import { Popup as LeafletPopup, useMap } from 'react-leaflet';
import { useSelector } from 'react-redux';

import type { LatLngTuple } from 'leaflet';
import type L from 'leaflet';
import type { Site } from 'store/Sites/types';
import { siteOnMapSelector } from 'store/Homepage/homepageSlice';
import SitePopupCard, { sitePopupStyles } from './SitePopupCard';

function Popup({ site, classes, autoOpen = true }: PopupProps) {
  const map = useMap();
  const siteOnMap = useSelector(siteOnMapSelector);
  const popupRef = useRef<L.Popup>(null);

  useEffect(() => {
    if (
      !map ||
      siteOnMap?.id !== site.id ||
      siteOnMap?.polygon.type !== 'Point' ||
      !autoOpen
    ) {
      return undefined;
    }

    const [_lng, lat] = siteOnMap.polygon.coordinates;
    const popupLng = siteOnMap.displayLng ?? _lng;
    const targetPoint: LatLngTuple = [lat, popupLng];

    const openPopup = () => {
      const popup = popupRef.current;
      if (!popup) {
        return;
      }
      popup.setLatLng(targetPoint).openOn(map);
    };

    // flyToBounds in HomepageMap starts after this effect and drops the
    // popup mid-animation. Open now, then again after each moveend so a
    // stopped previous fly (map._stop) cannot swallow a one-shot listener.
    openPopup();
    map.on('moveend', openPopup);

    return () => {
      map.off('moveend', openPopup);
    };
  }, [autoOpen, map, site.id, siteOnMap]);

  return (
    <LeafletPopup
      ref={siteOnMap?.id === site.id ? popupRef : null}
      closeButton={false}
      className={classes.popup}
      autoPan={false}
    >
      <SitePopupCard site={site} classes={classes} />
    </LeafletPopup>
  );
}

interface PopupIncomingProps {
  site: Site;
  // Dictates whether the popup automatically opens when the site is selected (site on map is set)
  autoOpen?: boolean;
}

type PopupProps = PopupIncomingProps & WithStyles<typeof sitePopupStyles>;

export default withStyles(sitePopupStyles)(Popup);
