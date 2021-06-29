import React, { useState } from "react";
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
  Snackbar,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import YouTube, { Options } from "react-youtube";

import reefImage from "../../../assets/reef-image.jpg";
import uploadIcon from "../../../assets/icon_upload.svg";
import { isAdmin } from "../../../helpers/user";
import { userInfoSelector } from "../../../store/User/userSlice";

const FeaturedMedia = ({
  reefId,
  url,
  featuredImage,
  surveyId,
  classes,
}: FeaturedMediaProps) => {
  const user = useSelector(userInfoSelector);
  const isReefAdmin = isAdmin(user, reefId);
  const [streamErrorAlertOpen, setStreamErrorAlertOpen] = useState(false);

  const playerOpts: Options = {
    playerVars: {
      autoplay: 1,
      mute: 1,
      controls: 0,
      modestbranding: 1,
    },
  };

  // const onVideoStateChange = (event: { target: any }) => {
  //   console.log(event.target.getPlayerState());
  // };

  const onVideoError = () => setStreamErrorAlertOpen(true);

  if (url) {
    return (
      <>
        <Snackbar
          className={classes.errorSnackbar}
          open={streamErrorAlertOpen}
          anchorOrigin={{ horizontal: "right", vertical: "top" }}
        >
          <Alert
            severity="error"
            onClose={() => setStreamErrorAlertOpen(false)}
            variant="filled"
          >
            Failed to play live stream.
          </Alert>
        </Snackbar>
        <Card className={classes.card}>
          <CardContent className={classes.content}>
            <YouTube
              containerClassName={classes.card}
              // onStateChange={onVideoStateChange}
              onError={onVideoError}
              className={classes.card}
              opts={playerOpts}
              videoId={url}
            />
          </CardContent>
        </Card>
      </>
    );
  }

  if (featuredImage && surveyId) {
    return (
      <Link to={`/reefs/${reefId}/survey_details/${surveyId}`}>
        <CardMedia
          className={classes.card}
          style={{ height: "100%" }}
          image={featuredImage}
        />
      </Link>
    );
  }

  return (
    <Card className={classes.card}>
      <div className={classes.noVideoCardHeader}>
        <Grid container direction="column" alignItems="center" spacing={2}>
          <Grid item>
            <Typography className={classes.noVideoCardHeaderText} variant="h5">
              {isReefAdmin ? "ADD YOUR FIRST SURVEY" : "SURVEY TO BE UPLOADED"}
            </Typography>
          </Grid>
          {isReefAdmin && (
            <Grid item>
              <IconButton component={Link} to={`/reefs/${reefId}/new_survey`}>
                <img src={uploadIcon} alt="upload" />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </div>
      <div className={classes.noVideoCardContent} />
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
      position: "relative",
    },
    content: {
      height: "100%",
      width: "100%",
      padding: "0",
    },
    noVideoCardHeader: {
      backgroundColor: "#033042",
      opacity: 0.75,
      position: "absolute",
      top: 0,
      width: "100%",
      padding: "2rem 0",
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
    errorSnackbar: {
      top: theme.spacing(9),
      right: theme.spacing(1),
      [theme.breakpoints.down("xs")]: {
        top: theme.spacing(1),
      },
    },
  });
};

interface FeaturedMediaIncomingProps {
  reefId: number;
  url?: string | null;
  featuredImage?: string | null;
  surveyId?: number | null;
}

FeaturedMedia.defaultProps = {
  url: null,
  featuredImage: null,
  surveyId: null,
};

type FeaturedMediaProps = WithStyles<typeof styles> &
  FeaturedMediaIncomingProps;

export default withStyles(styles)(FeaturedMedia);
