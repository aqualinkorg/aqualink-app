import React from 'react';
import { Link } from 'react-router-dom';
import {
  Theme,
  Dialog as MuiDialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  ButtonProps,
  Button,
  CircularProgress,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import Alert from '@mui/material/Alert';

function ActionButton({
  text,
  color,
  variant,
  size,
  disabled,
  loading,
  action,
  classes,
}: Action & { classes: any }) {
  return (
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
}

function Dialog({
  open,
  header,
  content = null,
  actions = [],
  error,
  onClose = () => {},
  classes,
}: DialogProps) {
  return (
    <MuiDialog fullWidth onClose={onClose} open={open}>
      {header && (
        <DialogTitle className={classes.dialogTitle}>
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
                  <ActionButton {...action} classes={classes} />
                </Link>
              );
            }
            return <ActionButton {...action} classes={classes} />;
          })}
      </DialogActions>
    </MuiDialog>
  );
}

const styles = (theme: Theme) =>
  createStyles({
    dialogTitle: {
      backgroundColor: theme.palette.primary.main,
      overflowWrap: 'break-word',
      color: 'white',
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

type DialogProps = DialogIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Dialog);
