import React from "react";
import {
  Button,
  Card,
  CardActions,
  CardHeader,
  Grid,
  IconButton,
  makeStyles,
  Theme,
  Tooltip,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/HighlightOffOutlined";
import FileIcon from "@material-ui/icons/InsertDriveFileOutlined";

import { plural } from "../../../helpers/stringUtils";

const FileList = ({ files, onFileDelete }: FileListProps) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2} className={classes.root}>
      <Grid item xs={12}>
        <Typography gutterBottom variant="h6">
          {files.length} {plural(files.length, "file")} to be uploaded
        </Typography>
      </Grid>
      {files.map((file) => (
        <Grid item key={file.name} lg={4} md={6} xs={12}>
          <Card variant="outlined">
            <CardHeader
              classes={{ content: classes.cardHeader }}
              title={
                <Typography
                  className={classes.cardHeaderTitle}
                  title={file.name}
                  color="textSecondary"
                  variant="h6"
                >
                  {file.name}
                </Typography>
              }
              action={
                <Tooltip title="Remove file" arrow placement="top">
                  <IconButton onClick={() => onFileDelete(file.name)}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              }
              avatar={<FileIcon className={classes.fileIcon} />}
            />
            <CardActions>
              <Button
                className={classes.uploadButton}
                size="small"
                variant="outlined"
                color="primary"
              >
                Upload File
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
  },
  cardHeader: {
    maxWidth: "calc(100% - 40px - 48px)", // Full width minus the two icons (file icon and delete icon)
  },
  cardHeaderTitle: {
    overflow: "hidden",
    width: "100%",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  uploadButton: {
    marginLeft: "auto",
  },
  fileIcon: {
    color: theme.palette.text.secondary,
  },
}));

interface FileListProps {
  files: File[];
  onFileDelete: (name: string) => void;
}

export default FileList;
