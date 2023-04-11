import React from "react";
import {
  Button,
  Grid,
  IconButton,
  Typography,
  makeStyles,
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { Link } from "react-router-dom";
import { Site } from "../../../store/Sites/types";

function downloadFile(url: string, fileName: string) {
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "text/plain",
    },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const downloadUrl = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      // eslint-disable-next-line fp/no-mutation
      link.href = downloadUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
    });
}

const exampleFiles = [
  {
    source: "hobo",
    fileName: "hobo_example.csv",
  },
  {
    source: "sonde",
    fileName: "sonde_example.csv",
  },
  {
    source: "metlog",
    fileName: "metlog_example.csv",
  },
];

const Header = ({ site }: HeaderProps) => {
  const classes = useStyles();
  return (
    <Grid container alignItems="center" spacing={1}>
      <Grid item>
        <IconButton color="primary" component={Link} to={`/sites/${site.id}`}>
          <ArrowBackIcon />
        </IconButton>
      </Grid>
      <Grid item>
        <Typography variant="h5">Upload Data</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6">
          You&apos;re about to upload data for the following parameters: site
          &quot;{site.name}&quot;.
        </Typography>
        <Typography variant="h6">
          Please confirm survey point and sensor type to continue.
        </Typography>
        <Typography style={{ fontSize: "0.8em" }}>
          You can find example file formats here:{" "}
          {exampleFiles.map((file, i) => (
            <span key={file.fileName}>
              <Button
                className={classes.downloadButton}
                onClick={() =>
                  downloadFile(
                    `${
                      process.env.REACT_APP_API_BASE_URL
                    }/time-series/sample-upload-files/${encodeURIComponent(
                      file.source
                    )}`,
                    file.fileName
                  )
                }
              >
                {file.source}
              </Button>
              {i !== exampleFiles.length - 1 ? ", " : ""}
            </span>
          ))}
        </Typography>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(() => ({
  downloadButton: {
    background: "none !important",
    border: "none",
    padding: "0 !important",
    color: "#069",
    textDecoration: "underline",
    cursor: "pointer",
    textTransform: "none",
    minWidth: 0,
  },
}));

interface HeaderProps {
  site: Site;
}

export default Header;
