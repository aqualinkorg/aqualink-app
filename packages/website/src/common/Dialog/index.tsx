import React from 'react';
import { Link } from 'react-router-dom';
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Dialog as MuiDialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  ButtonProps,
  Button,
  CircularProgress,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

const Dialog = ({
  open,
  header,
  content,
  actions,
  error,
  onClose,
  classes,
}: DialogProps) => {
  const ActionButton = ({
    text,
    color,
    variant,
    size,
    disabled,
    loading,
    action,
  }: Action) => (
    <Button
      key={text}
      color={color}
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={action}
    >
      {loading ? (
        <CircularProgress className={classes.loading} size={24} />
      ) : (
        text
      )}
    </Button>
  );

  return (
    <MuiDialog fullWidth onClose={onClose} open={open}>
      {header && (
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Typography variant="h4">{header}</Typography>
        </DialogTitle>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      <DialogContent dividers>{content}</DialogContent>
      <DialogActions>
        {actions &&
          actions.map((action) => {
            if (action.link) {
              return (
                <Link
                  key={action.text}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  to={action.link}
                >
                  {ActionButton(action)}
                </Link>
              );
            }
            return ActionButton(action);
          })}
      </DialogActions>
    </MuiDialog>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    dialogTitle: {
      backgroundColor: theme.palette.primary.main,
      overflowWrap: 'break-word',
    },
    loading: {
      color: 'white',
    },
  });

export interface Action {
  size: ButtonProps['size'];
  variant: ButtonProps['variant'];
  color: ButtonProps['color'];
  text: string;
  // eslint-disable-next-line react/no-unused-prop-types
  link?: string;
  disabled?: boolean;
  loading?: boolean;
  action: (...args: any[]) => void;
}

interface DialogIncomingProps {
  open: boolean;
  header?: string;
  content?: JSX.Element | null;
  actions?: Action[];
  error?: string;
  onClose?: (...args: any[]) => void;
}

Dialog.defaultProps = {
  header: undefined,
  content: null,
  actions: [],
  error: undefined,
  onClose: () => {},
};

type DialogProps = DialogIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Dialog);
