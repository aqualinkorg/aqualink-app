import React, { ChangeEvent } from "react";
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
import { DeleteOutlineOutlined } from "@material-ui/icons";

import {
  surveyPointOptions,
  observationOptions,
} from "../../../constants/uploadDropdowns";

const MediaCard = ({
  preview,
  surveyPoint,
  observation,
  comments,
  index,
  deleteCard,
  handleCommentsChange,
  handleObservationChange,
  handleSurveyPointChange,
  classes,
}: MediaCardProps) => {
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
            <CardMedia className={classes.cardImage} image={preview} />
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
                    value={item.key}
                    key={item.key}
                  >
                    {item.value}
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
          <Grid
            style={{ height: "100%" }}
            container
            justify="flex-end"
            alignItems="flex-end"
            item
            xs={1}
          >
            <IconButton onClick={() => deleteCard(index)}>
              <DeleteOutlineOutlined />
            </IconButton>
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
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "flex-end",
    },
    textField: {
      color: "black",
    },
  });

interface MediaCardIncomingProps {
  index: number;
  preview: string;
  surveyPoint: string;
  observation: string;
  comments: string;
  deleteCard: (index: number) => void;
  handleCommentsChange: (event: ChangeEvent<{ value: unknown }>) => void;
  handleObservationChange: (event: ChangeEvent<{ value: unknown }>) => void;
  handleSurveyPointChange: (event: ChangeEvent<{ value: unknown }>) => void;
}

type MediaCardProps = MediaCardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(MediaCard);
