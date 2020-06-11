import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Card,
  CardContent,
} from "@material-ui/core";
import ReactPlayer from "react-player";

const FeatureVideo = ({ url, classes }: FeatureVideoProps) => {
  return (
    <Card className={classes.card}>
      <CardContent className={classes.content}>
        <ReactPlayer
          height="100%"
          width="100%"
          playing
          muted
          light
          url={`${url}`}
        />
      </CardContent>
    </Card>
  );
};

const styles = () => {
  return createStyles({
    card: {
      height: "100%",
      width: "100%",
      display: "flex",
    },
    content: {
      height: "100%",
      width: "100%",
      padding: "0",
    },
  });
};

interface FeatureVideoIncomingProps {
  url: string;
}

type FeatureVideoProps = WithStyles<typeof styles> & FeatureVideoIncomingProps;

export default withStyles(styles)(FeatureVideo);
