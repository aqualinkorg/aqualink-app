import React, { useState, useCallback } from "react";
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

const UploadMedia = ({ reefName, changeTab, classes }: UploadMediaProps) => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles([...files, ...acceptedFiles]);
    },
    [files]
  );

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
        <Dropzone accept="image/png" onDrop={handleFileDrop}>
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

type UploadMediaProps = UploadMediaIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(UploadMedia);
