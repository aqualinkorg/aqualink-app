import React from 'react';
import { Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
// eslint-disable-next-line import/no-unresolved
import { Popup } from 'react-map-gl/maplibre';
import type { Site } from 'store/Sites/types';
import SitePopupCard, { sitePopupStyles } from './Popup/SitePopupCard';

function GlobePopup({ site, classes }: GlobePopupProps) {
  if (site.polygon.type !== 'Point') {
    return null;
  }

  const [lng, lat] = site.polygon.coordinates;
  const longitude = site.displayLng ?? lng;

  return (
    <Popup
      longitude={longitude}
      latitude={lat}
      anchor="bottom"
      offset={16}
      closeButton={false}
      closeOnClick={false}
      closeOnMove={false}
      focusAfterOpen={false}
      locationOccludedOpacity={0}
      className={classes.popup}
      maxWidth="240px"
    >
      <SitePopupCard site={site} classes={classes} />
    </Popup>
  );
}

const styles = (theme: Theme) => {
  const base = sitePopupStyles(theme);
  return createStyles({
    ...base,
    popup: {
      width: 215,
      '& .maplibregl-popup-content': {
        padding: 0,
        background: 'transparent',
        borderRadius: 4,
        boxShadow: 'none',
      },
    },
  });
};

interface GlobePopupIncomingProps {
  site: Site & { displayLng?: number };
}

type GlobePopupProps = GlobePopupIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(GlobePopup);
