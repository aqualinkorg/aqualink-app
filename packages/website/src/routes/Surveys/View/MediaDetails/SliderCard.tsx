import React from "react";
import {
  Card,
  CardMedia,
  CircularProgress,
  Grid,
  IconButton,
  withStyles,
  WithStyles,
  createStyles,
  Typography,
  Theme,
  Tooltip,
} from "@material-ui/core";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";

import { findOption } from "../../../../constants/uploadDropdowns";
import { SurveyMedia } from "../../../../store/Survey/types";

const SliderCard = ({
  loading,
  media,
  isReefAdmin,
  onSurveyMediaUpdate,
  classes,
}: SliderCardProps) => {
  const { id, url, comments, observations, featured } = media;
  return (
    <Card elevation={3} className={classes.shadowBox}>
      {loading ? (
        <Grid
          className={classes.fullHeight}
          container
          justify="center"
          alignItems="center"
          item
          xs={12}
        >
          <CircularProgress size="4rem" thickness={1} />
        </Grid>
      ) : (
        <Grid className={classes.fullHeight} container>
          <Grid className={classes.imageWrapper} item sm={12} md={6}>
            <CardMedia className={classes.cardImage} image={url} />
          </Grid>
          <Grid
            className={classes.mediaInfoWrapper}
            container
            item
            sm={12}
            md={6}
          >
            <Grid
              container
              item
              xs={10}
              justify="space-around"
              alignItems="flex-start"
              spacing={2}
            >
              <Grid item xs={12}>
                <Typography variant="h6">IMAGE OBSERVATION</Typography>
                <Typography variant="subtitle1">
                  {findOption(observations)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">IMAGE COMMENTS</Typography>
                <Typography variant="subtitle1">{comments}</Typography>
              </Grid>
            </Grid>
            {isReefAdmin && (
              <Grid container justify="flex-end" item xs={2}>
                {featured ? (
                  <Tooltip title="Featured image">
                    <IconButton className={classes.featuredIcon}>
                      <StarIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Set as featured image">
                    <IconButton
                      onClick={() => onSurveyMediaUpdate(id)}
                      className={classes.featuredIcon}
                    >
                      <StarBorderIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
    </Card>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    shadowBox: {
      backgroundColor: "#f5f6f6",
      color: theme.palette.text.secondary,
      marginBottom: "4rem",
      height: "28rem",
      [theme.breakpoints.down("sm")]: {
        height: "32rem",
      },
    },
    fullHeight: {
      height: "100%",
    },
    imageWrapper: {
      width: "100%",
      [theme.breakpoints.down("sm")]: {
        height: "50%",
      },
    },
    cardImage: {
      width: "100%",
      height: "100%",
    },
    mediaInfoWrapper: {
      height: "100%",
      overflowY: "auto",
      padding: theme.spacing(2, 2, 2, 3),
      [theme.breakpoints.down("sm")]: {
        height: "50%",
      },
    },
    featuredIcon: {
      height: "3rem",
      width: "3rem",
    },
  });

interface SliderCardIncomingProps {
  media: SurveyMedia;
  loading: boolean;
  isReefAdmin: boolean;
  onSurveyMediaUpdate: (mediaId: number) => void;
}

type SliderCardProps = SliderCardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SliderCard);
