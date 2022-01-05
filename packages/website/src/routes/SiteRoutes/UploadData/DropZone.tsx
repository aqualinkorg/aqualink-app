import React from "react";
import classNames from "classnames";
import DefaultDropzone from "react-dropzone";
import { makeStyles, Theme, Grid, Typography, Button } from "@material-ui/core";
import { fade } from "@material-ui/core/styles/colorManipulator";
import { grey } from "@material-ui/core/colors";

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const DropZone = () => {
  const classes = useStyles();

  return (
    <DefaultDropzone maxSize={MAX_SIZE_MB * 10 ** 6} accept={ACCEPTED_TYPES}>
      {({ getRootProps, getInputProps }) => (
        <Grid
          container
          {...getRootProps({ className: classes.root })}
          justify="center"
          direction="column"
          alignItems="center"
        >
          <input {...getInputProps()} />
          <Grid item>
            <Typography
              className={classes.bold}
              variant="subtitle2"
              display="block"
              align="center"
              gutterBottom
            >
              Drag and Drop your file(s)
            </Typography>
            <Typography
              gutterBottom
              variant="caption"
              display="block"
              align="center"
            >
              or
            </Typography>
            <Typography
              className={classes.bold}
              variant="subtitle2"
              display="block"
              align="center"
              gutterBottom
            >
              Upload file(s)
            </Typography>
          </Grid>
          <Grid item>
            <Button
              size="small"
              className={classes.button}
              color="primary"
              variant="outlined"
            >
              Select Files
            </Button>
          </Grid>
          <Grid item>
            <Typography
              gutterBottom
              variant="caption"
              display="block"
              align="center"
            >
              or
            </Typography>
            <Typography
              className={classes.bold}
              variant="subtitle2"
              display="block"
              align="center"
              gutterBottom
            >
              Copy and paste csv data
            </Typography>
            <Typography
              className={classNames(classes.bold, classes.grey)}
              variant="caption"
              display="block"
              align="center"
            >
              Supported format: .csv, .xls, .xlsx
            </Typography>
            <Typography
              className={classNames(classes.bold, classes.grey)}
              variant="caption"
              display="block"
              align="center"
            >
              Maximum upload total size: {MAX_SIZE_MB} Mb
            </Typography>
          </Grid>
        </Grid>
      )}
    </DefaultDropzone>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(5),
    border: `1px dashed ${theme.palette.primary.main}`,
    borderRadius: 10,
    backgroundColor: fade(theme.palette.primary.main, 0.1),
    padding: theme.spacing(4),
    "&:hover": {
      cursor: "pointer",
      backgroundColor: fade(theme.palette.primary.main, 0.15),
    },
    transition: theme.transitions.create(
      ["background-color", "box-shadow", "border"],
      {
        duration: "250ms",
        delay: "0ms",
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      }
    ),
  },
  bold: {
    fontWeight: 700,
  },
  grey: {
    color: grey[500],
  },
  button: {
    marginBottom: theme.spacing(2),
  },
}));

export default DropZone;
