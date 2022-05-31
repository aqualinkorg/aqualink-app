import React, { useRef, useLayoutEffect } from "react";
import Sketchfab from "@sketchfab/viewer-api";
// eslint-disable-next-line
import { withStyles, WithStyles, createStyles } from "@material-ui/core";

// url = "https://sketchfab.com/models/0fd310d08bd6472db293f574da0e200b/embed",

const SketchFab = () => {
  const iFrameRef = useRef(null);

  useLayoutEffect(() => {
    const iframe = iFrameRef.current;
    const version = "1.12.0";
    const client = new Sketchfab(version, iframe);

    const uid = "0fd310d08bd6472db293f574da0e200b";

    client.init(uid, {
      success: (api: any) => {
        console.log({ api });
        api.start();
        api.addEventListener("viewerready", () => {
          // API is ready to use
          console.log("Viewer is ready");
        });
      },
      error: () => {
        console.log("Viewer error");
      },
    });
  }, []);

  console.log({ Sketchfab });
  return (
    <iframe
      ref={iFrameRef}
      title="Sketchfab"
      frameBorder="0"
      allowFullScreen
      allow="autoplay; fullscreen; xr-spatial-tracking"
      xr-spatial-tracking
      execution-while-out-of-viewport
      execution-while-not-rendered
      web-share
      width="100%"
      height="100%"
      // src={url}
    />
  );
};

const styles = () => {
  return createStyles({
    map: {
      height: "100%",
      width: "100%",
      borderRadius: 4,
    },
  });
};

// interface SiteMapIncomingProps {
//   // url: string;
// }

// type SiteMapProps = WithStyles<typeof styles> & SiteMapIncomingProps;

export default withStyles(styles)(SketchFab);
