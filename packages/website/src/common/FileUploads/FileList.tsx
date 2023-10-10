import React from 'react';
import {
  Card,
  CardHeader,
  CircularProgress,
  Grid,
  IconButton,
  makeStyles,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { grey } from '@material-ui/core/colors';
import CloseIcon from '@material-ui/icons/HighlightOffOutlined';
import FileIcon from '@material-ui/icons/InsertDriveFileOutlined';
import classNames from 'classnames';

import { useSelector } from 'react-redux';
import {
  uploadsErrorSelector,
  uploadsInProgressSelector,
  uploadsResponseSelector,
} from 'store/uploads/uploadsSlice';
import { pluralize } from 'helpers/stringUtils';

const CIRCULAR_PROGRESS_SIZE = 36;

const FileList = ({ files, onFileDelete }: FileListProps) => {
  const classes = useStyles();
  const errors = useSelector(uploadsErrorSelector) as Record<
    string,
    string | null
  >;
  const loading = useSelector(uploadsInProgressSelector);
  const uploadResponse = useSelector(uploadsResponseSelector);

  return (
    <Grid container spacing={2} className={classes.root}>
      <Grid item xs={12}>
        <Typography gutterBottom variant="h6">
          {files.length} {pluralize(files.length, 'file')}{' '}
          {loading ? 'uploading' : 'to be uploaded'}
        </Typography>
      </Grid>
      {files.map(({ name }) => (
        <Grid item key={name} lg={4} md={6} xs={12}>
          <Card className={classes.card} variant="outlined">
            <CardHeader
              className={classNames({ [classes.loading]: loading })}
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
                  <IconButton
                    disabled={loading}
                    onClick={() => onFileDelete(name)}
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              }
              avatar={<FileIcon className={classes.fileIcon} />}
            />
            {loading && (
              <CircularProgress
                size={CIRCULAR_PROGRESS_SIZE}
                className={classes.circularProgress}
              />
            )}
          </Card>
          {errors?.[name] && <Alert severity="error">{errors[name]}</Alert>}
          {!loading &&
            !!uploadResponse?.some((x) => x.file === name && !x.error) && (
              <Alert severity="success">File uploaded</Alert>
            )}
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
    position: 'relative',
  },
  cardContent: {
    maxWidth: 'calc(100% - 40px - 48px)', // Full width minus the two icons (file icon and delete icon)
  },
  cardHeaderTitle: {
    overflow: 'hidden',
    width: '100%',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileIcon: {
    color: theme.palette.text.secondary,
  },
  loading: {
    opacity: 0.5,
    pointerEvents: 'none',
    cursor: 'default',
  },
  circularProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -CIRCULAR_PROGRESS_SIZE / 2,
    marginLeft: -CIRCULAR_PROGRESS_SIZE / 2,
    color: grey[500],
  },
}));

interface FileListProps {
  files: File[];
  onFileDelete: (name: string) => void;
}

export default FileList;
