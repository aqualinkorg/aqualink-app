import React, { ChangeEvent, useState, useCallback } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Grid,
  Paper,
  Typography,
  IconButton,
  CardMedia,
  MenuItem,
  TextField,
  Button,
  Dialog,
  Card,
  CardContent,
  Tooltip,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { DeleteOutlineOutlined } from "@material-ui/icons";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";

import observationOptions from "../../../constants/uploadDropdowns";
import { Pois } from "../../../store/Reefs/types";
import StarIcon from "../../../assets/starIcon.svg";

const MediaCard = ({
  preview,
  surveyPoint,
  observation,
  comments,
  surveyPointOptions,
  index,
  file,
  featuredFile,
  hidden,
  handleHiddenChange,
  handlePoiOptionAdd,
  deleteCard,
  setFeatured,
  handleCommentsChange,
  handleObservationChange,
  handleSurveyPointChange,
  classes,
}: MediaCardProps) => {
  const size = (file && file.size && file.size / 1000000)?.toFixed(2);
  const [addPoiDialogOpen, setAddPoiDialogOpen] = useState<boolean>(false);
  const [newPoiName, setNewPoiName] = useState<string>("");

  const handleNewPoiNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewPoiName(event.target.value);
  };

  const onImageClick = useCallback(() => {
    setFeatured(index);
  }, [index, setFeatured]);

  return (
    <>
      <Dialog
        onClose={() => setAddPoiDialogOpen(false)}
        open={addPoiDialogOpen}
      >
        <Card className={classes.newPoiDialog}>
          <CardContent>
            <Grid container justify="center" item xs={12}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  inputProps={{ className: classes.textField }}
                  fullWidth
                  placeholder="Survey Point"
                  value={newPoiName}
                  onChange={handleNewPoiNameChange}
                />
              </Grid>
              <Grid
                style={{ marginTop: "2rem" }}
                container
                justify="flex-end"
                item
                xs={12}
              >
                <Button
                  disabled={newPoiName === ""}
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    handlePoiOptionAdd(index, newPoiName);
                    setAddPoiDialogOpen(false);
                  }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Dialog>
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
                <div
                  tabIndex={-1}
                  role="button"
                  onClick={onImageClick}
                  onKeyDown={() => {}}
                  className={classes.image}
                >
                  <Grid
                    style={{ height: "50%" }}
                    container
                    item
                    xs={12}
                    alignItems="flex-start"
                    justify="flex-start"
                  >
                    {index === featuredFile && (
                      <Tooltip title="Featured image">
                        <img
                          className={classes.starIcon}
                          src={StarIcon}
                          alt="featured"
                        />
                      </Tooltip>
                    )}
                  </Grid>
                  <Grid
                    style={{ height: "50%" }}
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
                </div>
              </CardMedia>
            </Grid>
            <Grid container justify="center" item xs={3}>
              <Grid style={{ marginBottom: "1rem" }} item xs={10}>
                <Typography color="textSecondary" variant="h6">
                  Survey Point
                </Typography>
              </Grid>
              <Grid style={{ marginBottom: "2rem" }} item xs={10}>
                <TextField
                  className={classes.textField}
                  select
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
                  <MenuItem className={classes.textField}>
                    <AddIcon />
                    <Button
                      style={{ color: "black" }}
                      onClick={() => setAddPoiDialogOpen(true)}
                    >
                      Add new survey point
                    </Button>
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid style={{ marginBottom: "1rem" }} item xs={10}>
                <Typography color="textSecondary" variant="h6">
                  Observation
                </Typography>
              </Grid>
              <Grid style={{ marginBottom: "2rem" }} item xs={10}>
                <TextField
                  className={classes.textField}
                  select
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
                </TextField>
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
                  className={classes.textField}
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
                <Tooltip
                  title={
                    hidden ? "Make this image visible" : "Hide image from users"
                  }
                >
                  <IconButton onClick={() => handleHiddenChange(index)}>
                    {hidden ? (
                      <VisibilityOffIcon color="inherit" />
                    ) : (
                      <VisibilityIcon color="primary" />
                    )}
                  </IconButton>
                </Tooltip>
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
    </>
  );
};

const styles = (theme: Theme) =>
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
      transition: "all 0.3s ease",
      "&:hover": {
        filter: "brightness(70%)",
      },
    },
    textField: {
      color: "black",
      "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.23)",
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
    },
    mediaSize: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      height: "2rem",
      borderRadius: "2px 0 0 2px",
    },
    newPoiDialog: {
      height: "10rem",
      width: "20rem",
    },
    starIcon: {
      height: 42,
      padding: 8,
    },
    image: {
      height: "100%",
      cursor: "pointer",
      outline: "none",
    },
  });

interface MediaCardIncomingProps {
  index: number;
  preview: string;
  surveyPoint: string;
  observation: string;
  comments: string;
  surveyPointOptions: Pois[];
  file?: File | null;
  featuredFile: number | null;
  hidden: boolean;
  handleHiddenChange: (index: number) => void;
  handlePoiOptionAdd: (index: number, name: string) => void;
  deleteCard: (index: number) => void;
  setFeatured: (index: number) => void;
  handleCommentsChange: (event: ChangeEvent<{ value: unknown }>) => void;
  handleObservationChange: (event: ChangeEvent<{ value: unknown }>) => void;
  handleSurveyPointChange: (event: ChangeEvent<{ value: unknown }>) => void;
}

MediaCard.defaultProps = {
  file: null,
};

type MediaCardProps = MediaCardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(MediaCard);
