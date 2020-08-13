import React, { useState, useCallback } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  IconButton,
  Grid,
  Typography,
  Paper,
  CardMedia,
  Theme,
} from "@material-ui/core";
import { ArrowBack, CloudUploadOutlined } from "@material-ui/icons";
import Dropzone from "react-dropzone";

const UploadMedia = ({ reefName, changeTab, classes }: UploadMediaProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles([...files, ...acceptedFiles]);
      setPreviews([
        ...previews,
        ...acceptedFiles.map((file) => URL.createObjectURL(file)),
      ]);
    },
    [files, previews]
  );

  const fileCards = previews.map((preview) => {
    return (
      <Grid style={{ marginTop: "2rem" }} key={preview} container item xs={12}>
        {/* <img key={preview} src={preview} alt="uploaded-media" /> */}
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
          accept="image/png, image/jpeg, image/gif"
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

const styles = (theme: Theme) =>
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
      backgroundColor: theme.palette.primary.light,
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
  });

interface UploadMediaIncomingProps {
  changeTab: (index: number) => void;
  reefName: string | null;
}

type UploadMediaProps = UploadMediaIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(UploadMedia);
