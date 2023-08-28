import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Theme,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from '@material-ui/icons/Warning';
import { yellow } from '@material-ui/core/colors';

import { UploadTimeSeriesResult } from 'services/uploadServices';

const YELLOW = yellow[600];

const DetailsDialog = ({ open, details, onClose }: DetailsDialogProps) => {
  const classes = useStyles();

  return (
    <Dialog maxWidth="md" fullWidth open={open} onClose={onClose}>
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <Typography variant="h4">Upload Details</Typography>
        <IconButton className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <List>
          {details.map(({ file, ignoredHeaders }, index) =>
            ignoredHeaders?.length ? (
              // eslint-disable-next-line react/no-array-index-key
              <ListItem key={`${file}-${index}`}>
                <ListItemAvatar>
                  <Avatar className={classes.avatar}>
                    <WarningIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={file}
                  primaryTypographyProps={{
                    color: 'textSecondary',
                    variant: 'h5',
                  }}
                  secondary={`
                      These columns are not configured for import yet and were
                      not uploaded: ${ignoredHeaders
                        .map((header) => `"${header}"`)
                        .join(', ')}.
                    `}
                  secondaryTypographyProps={{ variant: 'subtitle1' }}
                />
              </ListItem>
            ) : null,
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  dialogTitle: {
    backgroundColor: theme.palette.primary.main,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  avatar: {
    backgroundColor: YELLOW,
  },
}));

interface DetailsDialogProps {
  open: boolean;
  details: UploadTimeSeriesResult[];
  onClose: () => void;
}

export default DetailsDialog;
