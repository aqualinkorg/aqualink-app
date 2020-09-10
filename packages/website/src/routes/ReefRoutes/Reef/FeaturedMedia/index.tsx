import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Theme,
} from "@material-ui/core";
import ReactPlayer from "react-player";

import reefImage from "../../../../assets/reef-image.jpg";
import uploadIcon from "../../../../assets/icon_upload.svg";

const FeaturedMedia = ({ url, featuredImage, classes }: FeaturedMediaProps) => {
  if (url) {
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
  }

  if (featuredImage) {
    return (
      <CardMedia
        className={classes.card}
        style={{ height: "100%" }}
        image={featuredImage}
      />
    );
  }

  return (
    <Card className={classes.card}>
      <div className={classes.noVideoCard}>
        <div className={classes.noVideoCardHeader}>
          <Grid container item spacing={2}>
            <Grid container justify="center" item xs={12}>
              <Typography
                className={classes.noVideoCardHeaderText}
                variant="h5"
              >
                IMAGE TO BE UPLOADED
              </Typography>
            </Grid>
            <Grid container justify="center" item xs={12}>
              <IconButton>
                <img src={uploadIcon} alt="upload" />
              </IconButton>
            </Grid>
          </Grid>
        </div>
        <div className={classes.noVideoCardContent} />
      </div>
    </Card>
  );
};

const styles = (theme: Theme) => {
  return createStyles({
    card: {
      height: "100%",
      width: "100%",
      display: "flex",
      borderRadius: 4,
    },
    content: {
      height: "100%",
      width: "100%",
      padding: "0",
    },
    noVideoCard: {
      position: "relative",
      height: "100%",
      width: "100%",
    },
    noVideoCardHeader: {
      backgroundColor: "#033042",
      opacity: 0.75,
      position: "absolute",
      top: 0,
      width: "100%",
      padding: "2rem 0 1rem",
      zIndex: 1,
    },
    noVideoCardHeaderText: {
      opacity: 0.5,
      [theme.breakpoints.between("md", 1350)]: {
        fontSize: 15,
      },
    },
    noVideoCardContent: {
      width: "100%",
      height: "100%",
      backgroundImage: `url(${reefImage})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      filter: "blur(2px)",
    },
    playIconWrapper: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, 0)",
    },
    playIcon: {
      opacity: 0.5,
      color: theme.palette.primary.light,
      fontSize: "8rem",
    },
  });
};

interface FeaturedMediaIncomingProps {
  url?: string | null;
  featuredImage?: string | null;
}

type FeaturedMediaProps = WithStyles<typeof styles> &
  FeaturedMediaIncomingProps;

export default withStyles(styles)(FeaturedMedia);
