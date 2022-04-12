import React, { useState } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  IconButton,
  Collapse,
  LinearProgress,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CloseIcon from "@material-ui/icons/Close";
import DeleteDialog, { Action } from "../Dialog";

const DeleteButton = ({
  header,
  content,
  onConfirm,
  onSuccess,
  onError,
  classes,
}: DeleteButtonProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setAlertOpen(false);
    setAlertText("");
  };

  const onDelete = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onSuccess?.();
    } catch (error) {
      onError?.();
      setAlertOpen(true);
      setAlertText((error as any)?.message);
    }
    setLoading(false);
  };

  const dialogActions: Action[] = [
    {
      size: "small",
      variant: "outlined",
      color: "secondary",
      text: "Cancel",
      action: handleClose,
    },
    {
      size: "small",
      variant: "outlined",
      color: "primary",
      text: "Yes",
      action: onDelete,
    },
  ];

  return (
    <>
      <IconButton onClick={handleClickOpen}>
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
};

const styles = () =>
  createStyles({
    alert: {
      width: "100%",
    },
  });

interface DeleteButtonIncomingProps {
  header?: string;
  content?: JSX.Element | null;
  onConfirm: () => Promise<any>;
  onSuccess?: () => void;
  onError?: () => void;
}

DeleteButton.defaultProps = {
  header: undefined,
  content: null,
  onSuccess: () => {},
  onError: () => {},
};

type DeleteButtonProps = DeleteButtonIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(DeleteButton);
