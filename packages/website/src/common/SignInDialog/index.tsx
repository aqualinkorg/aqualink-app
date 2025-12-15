import React, { BaseSyntheticEvent, useEffect, useState } from 'react';
import isEmail from 'validator/lib/isEmail';
import {
  Dialog,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  IconButton,
  TextField,
  Button,
  LinearProgress,
  Collapse,
  Alert,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import CloseIcon from '@mui/icons-material/Close';
import {
  SubmitErrorHandler,
  useForm,
  Controller,
  SubmitHandler,
} from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';

import {
  resetPassword,
  signInUser,
  userInfoSelector,
  userLoadingSelector,
  userErrorSelector,
  clearError,
} from 'store/User/userSlice';
import { UserSignInParams } from 'store/User/types';
import dialogStyles from '../styles/dialogStyles';
import { SignInFormFields } from '../types';

function SignInDialog({
  open,
  handleRegisterOpen,
  handleSignInOpen,
  classes,
}: SignInDialogProps) {
  const dispatch = useAppDispatch();
  const user = useSelector(userInfoSelector);
  const loading = useSelector(userLoadingSelector);
  const error = useSelector(userErrorSelector);
  const [errorAlertOpen, setErrorAlertOpen] = useState<boolean>(false);
  const [passwordResetEmail, setPasswordResetEmail] = useState<string>('');
  const {
    formState: { errors },
    handleSubmit,
    getValues,
    clearErrors,
    control,
  } = useForm<SignInFormFields>({
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (user) {
      handleSignInOpen(false);
    }
    if (error) {
      setErrorAlertOpen(true);
    }
  }, [user, handleSignInOpen, error]);

  const resetPasswordHelper = (
    email?: string,
    event?: BaseSyntheticEvent<object, any, any>,
  ) => {
    if (event) {
      event.preventDefault();
    }
    if (!email) return;
    dispatch(resetPassword({ email: email.toLowerCase() }));
    setPasswordResetEmail(email.toLowerCase());
    clearErrors('password');
  };

  const onSubmit = (
    data: SignInFormFields,
    event?: BaseSyntheticEvent<object, HTMLElement, HTMLElement>,
  ) => {
    if (event) {
      event.preventDefault();
    }
    const registerInfo: UserSignInParams = {
      email: data.emailAddress.toLowerCase(),
      password: data.password,
    };
    dispatch(signInUser(registerInfo));
  };

  const onResetSubmitError: SubmitErrorHandler<SignInFormFields> = (
    err,
    event,
  ) => {
    if (err.emailAddress) return;
    const values = getValues();
    resetPasswordHelper(values.emailAddress, event);
  };

  const onResetSubmitHandler: SubmitHandler<SignInFormFields> = (
    data,
    event,
  ) => {
    resetPasswordHelper(data.emailAddress, event);
  };

  const clearUserError = () => dispatch(clearError());

  return (
    <Dialog
      TransitionProps={{
        onEnter: () => {
          clearUserError();
          setPasswordResetEmail('');
        },
      }}
      open={open}
      maxWidth="xs"
    >
      <Card elevation={0}>
        <CardHeader
          className={classes.dialogHeader}
          title={
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Grid container>
                  <Typography variant="h4">Aqua</Typography>
                  <Typography
                    className={classes.dialogHeaderSecondPart}
                    variant="h4"
                  >
                    link
                  </Typography>
                </Grid>
              </Grid>
              <Grid item>
                <IconButton
                  className={classes.closeButton}
                  size="small"
                  onClick={() => handleSignInOpen(false)}
                >
                  <CloseIcon />
                </IconButton>
              </Grid>
            </Grid>
          }
        />
        {loading && <LinearProgress />}
        {error && (
          <Collapse in={errorAlertOpen}>
            <Alert
              severity="error"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setErrorAlertOpen(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          </Collapse>
        )}
        <Collapse in={passwordResetEmail !== ''}>
          <Alert
            severity="success"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setPasswordResetEmail('');
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {`Password reset email sent to ${passwordResetEmail}.`}
          </Alert>
        </Collapse>
        <CardContent>
          <Grid container justifyContent="center" item xs={12}>
            <Grid className={classes.dialogContentTitle} container item xs={10}>
              <Grid item>
                <Typography variant="h5" color="textSecondary">
                  Sign In
                </Typography>
              </Grid>
            </Grid>
            <Grid container item xs={10}>
              <form className={classes.form} onSubmit={handleSubmit(onSubmit)}>
                <Grid className={classes.textFieldWrapper} item xs={12}>
                  {/* TODO: ADD THIS WHEN WE ENABLE GOOGLE LOGIN */}
                  {/* <Typography className={classes.formText} variant="subtitle2">
                    or login with email address
                  </Typography> */}
                  <Controller
                    name="emailAddress"
                    control={control}
                    rules={{
                      required: 'This is a required field',
                      validate: (value) => isEmail(value),
                    }}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        id="emailAddress"
                        placeholder="Email Address"
                        helperText={
                          (errors.emailAddress &&
                            (errors.emailAddress.type === 'validate'
                              ? 'Invalid email address'
                              : errors.emailAddress.message)) ||
                          ''
                        }
                        label="Email Address"
                        error={!!errors.emailAddress}
                        fullWidth
                        variant="outlined"
                        slotProps={{
                          htmlInput: { className: classes.textField },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid className={classes.textFieldWrapper} item xs={12}>
                  <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    rules={{ required: 'This is a required field' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        id="password"
                        type="password"
                        placeholder="Password"
                        helperText={
                          passwordResetEmail !== '' && errors.password
                            ? errors.password.message
                            : ''
                        }
                        label="Password"
                        error={passwordResetEmail !== '' && !!errors.password}
                        fullWidth
                        variant="outlined"
                        slotProps={{
                          htmlInput: { className: classes.textField },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid container item xs={12}>
                  <Button
                    className={classes.forgotPasswordButton}
                    onClick={handleSubmit(
                      onResetSubmitHandler,
                      onResetSubmitError,
                    )}
                  >
                    <Typography variant="subtitle2" color="textSecondary">
                      Forgot your password?
                    </Typography>
                  </Button>
                </Grid>
                <Grid className={classes.button} item xs={12}>
                  <Button
                    fullWidth
                    type="submit"
                    color="primary"
                    variant="contained"
                    size="large"
                  >
                    SIGN IN
                  </Button>
                </Grid>
                <Grid container item xs={12}>
                  <Typography
                    className={classes.formText}
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    Don&#39;t have an account?{' '}
                    <Button
                      onClick={() => {
                        handleRegisterOpen(true);
                        handleSignInOpen(false);
                      }}
                      color="primary"
                    >
                      SIGN UP
                    </Button>
                  </Typography>
                </Grid>
              </form>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Dialog>
  );
}

const styles = () =>
  createStyles({
    ...dialogStyles,
    forgotPasswordButton: {
      color: 'inherit',
      textDecoration: 'none',
    },
  });

interface SignInDialogIncomingProps {
  open: boolean;
  handleRegisterOpen: (open: boolean) => void;
  handleSignInOpen: (open: boolean) => void;
}

type SignInDialogProps = SignInDialogIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(SignInDialog);
