import React, { useState, useCallback, ChangeEvent } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  IconButton,
  Grid,
  Typography,
} from "@material-ui/core";
import { ArrowBack, CloudUploadOutlined } from "@material-ui/icons";
import Dropzone from "react-dropzone";

import MediaCard from "./MediaCard";

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
      <MediaCard
        key={preview}
        index={index}
        preview={preview}
        file={files[index]}
        surveyPoint={
          (metadata && metadata[index] && metadata[index].surveyPoint) || ""
        }
        observation={
          (metadata && metadata[index] && metadata[index].observation) || ""
        }
        comments={
          (metadata && metadata[index] && metadata[index].comments) || ""
        }
        deleteCard={deleteCard}
        handleCommentsChange={handleCommentsChange(index)}
        handleObservationChange={handleObservationChange(index)}
        handleSurveyPointChange={handleSurveyPointChange(index)}
      />
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
