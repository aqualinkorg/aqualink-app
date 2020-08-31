import React, { ChangeEvent, useEffect, useState } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Paper,
  Typography,
  IconButton,
  CardMedia,
  Select,
  MenuItem,
  TextField,
} from "@material-ui/core";
import { DeleteOutlineOutlined, Visibility } from "@material-ui/icons";
import observationOptions from "../../../constants/uploadDropdowns";
import reefServices from "../../../services/reefServices";
import { Pois } from "../../../store/Reefs/types";

const MediaCard = ({
  reefId,
  preview,
  surveyPoint,
  observation,
  comments,
  index,
  file,
  featuredFile,
  deleteCard,
  setFeatured,
  handleCommentsChange,
  handleObservationChange,
  handleSurveyPointChange,
  classes,
}: MediaCardProps) => {
  const size = (file && file.size && file.size / 1000000)?.toFixed(2);
  const [surveyPointOptions, setSurveyPointOptions] = useState<Pois[]>([]);

  useEffect(() => {
    reefServices
      .getReefPois(`${reefId}`)
      .then((response) => setSurveyPointOptions(response.data));
  }, [setSurveyPointOptions, reefId]);

  return (
    <Grid style={{ marginTop: "2rem" }} container item xs={12}>
      <Paper elevation={0} className={classes.mediaCardWrapper}>
        <Grid
          style={{ height: "100%" }}
          container
          alignItems="center"
          justify="space-between"
          item
          xs={12}
        >
          <Grid style={{ height: "100%" }} item xs={3}>
            <CardMedia className={classes.cardImage} image={preview}>
              <Grid
                style={{ height: "100%" }}
                container
                item
                xs={12}
                alignItems="flex-end"
                justify="flex-end"
              >
                {size && (
                  <Grid
                    className={classes.mediaSize}
                    container
                    alignItems="center"
                    justify="center"
                    item
                    xs={3}
                  >
                    <Typography variant="subtitle2">{size} MB</Typography>
                  </Grid>
                )}
              </Grid>
            </CardMedia>
          </Grid>
          <Grid container justify="center" item xs={3}>
            <Grid style={{ marginBottom: "1rem" }} item xs={10}>
              <Typography color="textSecondary" variant="h6">
                Survey Point
              </Typography>
            </Grid>
            <Grid style={{ marginBottom: "2rem" }} item xs={10}>
              <Select
                id="surveyPoint"
                name="surveyPoint"
                onChange={handleSurveyPointChange}
                value={surveyPoint}
                fullWidth
                variant="outlined"
                inputProps={{
                  className: classes.textField,
                }}
              >
                {surveyPointOptions.map((item) => (
                  <MenuItem
                    className={classes.textField}
                    value={item.id}
                    key={item.id}
                  >
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            <Grid style={{ marginBottom: "1rem" }} item xs={10}>
              <Typography color="textSecondary" variant="h6">
                Observation
              </Typography>
            </Grid>
            <Grid style={{ marginBottom: "2rem" }} item xs={10}>
              <Select
                id="observation"
                name="observation"
                onChange={handleObservationChange}
                value={observation}
                placeholder="Select One"
                fullWidth
                variant="outlined"
                inputProps={{
                  className: classes.textField,
                }}
              >
                {observationOptions.map((item) => (
                  <MenuItem
                    className={classes.textField}
                    value={item.key}
                    key={item.key}
                  >
                    {item.value}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
          <Grid container justify="center" item xs={5}>
            <Grid style={{ marginBottom: "1rem" }} item xs={12}>
              <Typography color="textSecondary" variant="h6">
                Comments
              </Typography>
            </Grid>
            <Grid style={{ marginBottom: "2rem" }} item xs={12}>
              <TextField
                variant="outlined"
                multiline
                name="comments"
                placeholder="Comments"
                onChange={handleCommentsChange}
                value={comments}
                rows="8"
                fullWidth
                inputProps={{
                  className: classes.textField,
                }}
              />
            </Grid>
          </Grid>
          <Grid style={{ height: "100%" }} container item xs={1}>
            <Grid
              container
              item
              alignItems="flex-start"
              justify="flex-end"
              xs={12}
            >
              <IconButton onClick={() => setFeatured(index)}>
                <Visibility
                  color={featuredFile === index ? "primary" : "inherit"}
                />
              </IconButton>
            </Grid>
            <Grid
              container
              item
              alignItems="flex-end"
              justify="flex-end"
              xs={12}
            >
              <IconButton onClick={() => deleteCard(index)}>
                <DeleteOutlineOutlined />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

const styles = () =>
  createStyles({
    mediaCardWrapper: {
      width: "100%",
      border: 1,
      borderStyle: "solid",
      borderColor: "#dddddd",
      borderRadius: 2,
      height: "18rem",
    },
    cardImage: {
      height: "100%",
      width: "100%",
      borderRadius: "2px 0 0 2px",
    },
    textField: {
      color: "black",
    },
    mediaSize: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      height: "2rem",
      borderRadius: "2px 0 0 2px",
    },
  });

interface MediaCardIncomingProps {
  reefId: number;
  index: number;
  preview: string;
  surveyPoint: string;
  observation: string;
  comments: string;
  file?: File;
  featuredFile: number | null;
  deleteCard: (index: number) => void;
  setFeatured: (index: number) => void;
  handleCommentsChange: (event: ChangeEvent<{ value: unknown }>) => void;
  handleObservationChange: (event: ChangeEvent<{ value: unknown }>) => void;
  handleSurveyPointChange: (event: ChangeEvent<{ value: unknown }>) => void;
}

type MediaCardProps = MediaCardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(MediaCard);
