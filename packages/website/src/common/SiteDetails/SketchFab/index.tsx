/* eslint-disable react/no-unknown-property */
import { useRef, useLayoutEffect } from 'react';
import Sketchfab from '@sketchfab/viewer-api';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

const SketchFab = ({ classes, uuid }: SiteMapProps) => {
  const iFrameRef = useRef(null);

  useLayoutEffect(() => {
    const iframe = iFrameRef.current;
    const version = '1.12.0';
    const client = new Sketchfab(version, iframe);

    client.init(uuid, {
      success: (api: any) => {
        api.start();
      },
      error: () => {
        console.error('Viewer error');
      },
    });
  }, [uuid]);

  return (
    <iframe
      ref={iFrameRef}
      title="Sketchfab"
      allowFullScreen
      allow="autoplay; fullscreen; xr-spatial-tracking; web-share; execution-while-not-rendered; execution-while-out-of-viewport"
      className={classes.map}
    />
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
  uuid: string;
}

type SiteMapProps = WithStyles<typeof styles> & SiteMapIncomingProps;

export default withStyles(styles)(SketchFab);
