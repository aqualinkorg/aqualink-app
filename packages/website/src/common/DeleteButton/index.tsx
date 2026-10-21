import React, { useState } from 'react';
import { IconButton, Collapse, LinearProgress } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import Alert from '@mui/material/Alert';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import DeleteDialog, { Action } from '../Dialog';

function DeleteButton({
  header,
  content = null,
  onConfirm,
  onSuccess = () => {},
  onError = () => {},
  classes,
}: DeleteButtonProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setAlertOpen(false);
    setAlertText('');
  };

  const onDelete = async () => {
    // Guard against a second request being fired while the first is still in
    // flight, which would delete an already deleted resource and fail with a 404.
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      await onConfirm();
      onSuccess?.();
      handleClose();
    } catch (error) {
      onError?.();
      setAlertOpen(true);
      setAlertText((error as any)?.message);
    }
    setLoading(false);
  };

  const dialogActions: Action[] = [
    {
      size: 'small',
      variant: 'outlined',
      color: 'secondary',
      text: 'Cancel',
      action: handleClose,
      disabled: loading,
    },
    {
      size: 'small',
      variant: 'outlined',
      color: 'primary',
      text: 'Yes',
      action: onDelete,
      disabled: loading,
    },
  ];

  return (
    <>
      <IconButton onClick={handleClickOpen} size="large">
        <DeleteOutlineIcon color="primary" />
      </IconButton>
      <DeleteDialog
        open={open}
        onClose={handleClose}
        header={header}
        content={
          <>
            {content}
            {loading && <LinearProgress />}
            <Collapse className={classes.alert} in={alertOpen}>
              <Alert
                severity="error"
                action={
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setAlertOpen(false);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                {alertText}
              </Alert>
            </Collapse>
          </>
        }
        actions={dialogActions}
      />
    </>
  );
}

const styles = () =>
  createStyles({
    alert: {
      width: '100%',
    },
  });

interface DeleteButtonIncomingProps {
  header?: string;
  content?: JSX.Element | null;
  onConfirm: () => Promise<any>;
  onSuccess?: () => void;
  onError?: () => void;
}

type DeleteButtonProps = DeleteButtonIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(DeleteButton);
