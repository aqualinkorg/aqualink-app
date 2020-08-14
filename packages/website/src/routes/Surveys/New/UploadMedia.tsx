import React, { useState, useCallback, ChangeEvent } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  IconButton,
  Grid,
  Typography,
  Paper,
  CardMedia,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import {
  ArrowBack,
  CloudUploadOutlined,
  DeleteOutlineOutlined,
} from "@material-ui/icons";
import Dropzone from "react-dropzone";

import {
  surveyPointOptions,
  observationOptions,
} from "../../../constants/uploadDropdowns";

const UploadMedia = ({ reefName, changeTab, classes }: UploadMediaProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Metadata[]>([]);

  const handleFileDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles([...files, ...acceptedFiles]);
      setPreviews([
        ...previews,
        ...acceptedFiles.map((file) => URL.createObjectURL(file)),
      ]);
      setMetadata([
        ...metadata,
        ...acceptedFiles.map(() => ({
          observation: "",
          surveyPoint: "",
          comments: "",
        })),
      ]);
    },
    [files, previews, metadata]
  );

  const deleteCard = (index: number) => {
    setPreviews(previews.filter((item, key) => key !== index));
    setFiles(files.filter((item, key) => key !== index));
    setMetadata(metadata.filter((item, key) => key !== index));
  };

  const handleSurveyPointChange = (index: number) => {
    return (event: ChangeEvent<{ value: unknown }>) => {
      const surveyPoint = event.target.value as string;
      const newMetadata = metadata.map((item, key) => {
        if (key === index) {
          return {
            ...item,
            surveyPoint,
          };
        }
        return item;
      });
      setMetadata(newMetadata);
    };
  };

  const handleObservationChange = (index: number) => {
    return (event: ChangeEvent<{ value: unknown }>) => {
      const observation = event.target.value as string;
      const newMetadata = metadata.map((item, key) => {
        if (key === index) {
          return {
            ...item,
            observation,
          };
        }
        return item;
      });
      setMetadata(newMetadata);
    };
  };

  const handleCommentsChange = (index: number) => {
    return (event: ChangeEvent<{ value: unknown }>) => {
      const comments = event.target.value as string;
      const newMetadata = metadata.map((item, key) => {
        if (key === index) {
          return {
            ...item,
            comments,
          };
        }
        return item;
      });
      setMetadata(newMetadata);
    };
  };

  const fileCards = previews.map((preview, index) => {
    return (
      <Grid key={preview} style={{ marginTop: "2rem" }} container item xs={12}>
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
              <CardMedia
                className={classes.cardImage}
                component={
                  files[index].type.startsWith("video") ? "video" : "image"
                }
                image={preview}
              />
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
                  onChange={handleSurveyPointChange(index)}
                  value={(metadata[index] && metadata[index].surveyPoint) || ""}
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
                  onChange={handleObservationChange(index)}
                  value={(metadata[index] && metadata[index].observation) || ""}
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
                  onChange={handleCommentsChange(index)}
                  value={(metadata[index] && metadata[index].comments) || ""}
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
  });

  return (
    <Grid className={classes.root} container justify="center" item xs={12}>
      <Grid container justify="flex-start" alignItems="center" item xs={10}>
        <Grid item>
          <IconButton
            edge="start"
            color="primary"
            aria-label="menu"
            onClick={() => changeTab(0)}
          >
            <ArrowBack />
          </IconButton>
        </Grid>
        <Grid item>
          {reefName && (
            <Typography variant="h5">{`${reefName.toUpperCase()} MEDIA UPLOAD`}</Typography>
          )}
        </Grid>
      </Grid>
      <Grid container justify="center" item xs={4}>
        <Dropzone
          accept="image/png, image/jpeg, image/gif, video/mp4"
          onDrop={handleFileDrop}
        >
          {({ getRootProps, getInputProps }) => (
            <Grid
              container
              justify="center"
              {...getRootProps({ className: classes.dropzone })}
            >
              <input {...getInputProps()} />
              <Grid container justify="center" item xs={12}>
                <CloudUploadOutlined fontSize="large" color="primary" />
              </Grid>
              <Grid container justify="center" item xs={12}>
                <Typography variant="h5">
                  Drag and drop or click here
                </Typography>
              </Grid>
              <Grid container justify="center" item xs={12}>
                <Typography variant="subtitle2">
                  Supported formats: .jpg .mpeg .png .gif. mov
                </Typography>
              </Grid>
            </Grid>
          )}
        </Dropzone>
      </Grid>
      <Grid style={{ marginBottom: "2rem" }} container item xs={9}>
        {fileCards}
      </Grid>
    </Grid>
  );
};

const styles = () =>
  createStyles({
    root: {
      marginTop: "2rem",
    },
    dropzone: {
      borderWidth: 2,
      borderRadius: 2,
      borderColor: "#eeeeee",
      borderStyle: "dashed",
      backgroundColor: "#fafafa",
      height: "8rem",
      width: "100%",
    },
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

interface UploadMediaIncomingProps {
  changeTab: (index: number) => void;
  reefName: string | null;
}

interface Metadata {
  surveyPoint: string;
  observation: string;
  comments: string;
}

type UploadMediaProps = UploadMediaIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(UploadMedia);
