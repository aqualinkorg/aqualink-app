import React from "react";
import {
  Card,
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

import { pluralize } from "../../../helpers/stringUtils";

const FileList = ({ files, onFileDelete }: FileListProps) => {
  const classes = useStyles();

  return (
    <Grid container spacing={2} className={classes.root}>
      <Grid item xs={12}>
        <Typography gutterBottom variant="h6">
          {files.length} {pluralize(files.length, "file")}{" "}
        </Typography>
      </Grid>
      {files.map(({ name }) => (
        <Grid item key={name} lg={4} md={6} xs={12}>
          <Card className={classes.card} variant="outlined">
            <CardHeader
              classes={{ content: classes.cardContent }}
              title={
                <Typography
                  className={classes.cardHeaderTitle}
                  title={name}
                  color="textSecondary"
                  variant="h6"
                >
                  {name}
                </Typography>
              }
              action={
                <Tooltip title="Remove file" arrow placement="top">
                  <IconButton onClick={() => onFileDelete(name)}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              }
              avatar={<FileIcon className={classes.fileIcon} />}
            />
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
  card: {
    position: "relative",
  },
  cardContent: {
    maxWidth: "calc(100% - 40px - 48px)", // Full width minus the two icons (file icon and delete icon)
  },
  cardHeaderTitle: {
    overflow: "hidden",
    width: "100%",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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
