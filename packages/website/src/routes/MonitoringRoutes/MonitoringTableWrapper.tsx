import { Button, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useSelector } from 'react-redux';
import { userInfoSelector } from 'store/User/userSlice';
import { useSnackbar } from 'notistack';
import LoadingBackdrop from 'common/LoadingBackdrop';
import { fetchData } from './utils';

interface MonitoringTableWrapperProps<T, A> {
  getResult: (token: string) => Promise<T>;
  ResultsComponent: React.FC<A>;
  resultsComponentProps: (results: T) => A;
  pageTitle: string;
  pageDescription?: string | React.JSX.Element;
  filters?: React.JSX.Element;
  fetchOnEnter?: boolean;
  fetchOnPageLoad?: boolean;
}

function MonitoringTableWrapper<T, A>({
  getResult,
  ResultsComponent,
  resultsComponentProps,
  pageTitle,
  pageDescription,
  filters,
  fetchOnEnter = false,
  fetchOnPageLoad = false,
}: MonitoringTableWrapperProps<T, A>) {
  const user = useSelector(userInfoSelector);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [result, setResult] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (fetchOnPageLoad) {
      onGetMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onGetMetrics = React.useCallback(() => {
    fetchData({
      user,
      enqueueSnackbar,
      setLoading,
      setResult,
      getResult,
    });
  }, [enqueueSnackbar, getResult, user]);

  React.useEffect(() => {
    const keyDownHandler = (event: any) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onGetMetrics();
      }
    };
    if (fetchOnEnter) document.addEventListener('keydown', keyDownHandler);
    return () => {
      if (fetchOnEnter) document.removeEventListener('keydown', keyDownHandler);
    };
  }, [fetchOnEnter, onGetMetrics]);

  const props = result !== null && resultsComponentProps(result);

  return (
    <div>
      <LoadingBackdrop loading={loading} />
      <Link to="/monitoring">
        <Button
          variant="outlined"
          color="primary"
          className={classes.button}
          startIcon={<ArrowBackIcon />}
        >
          Go back
        </Button>
      </Link>
      <Button
        color="primary"
        variant="outlined"
        onClick={() => onGetMetrics()}
        className={classes.button}
      >
        Refresh
      </Button>
      <Typography className={classes.pageTitle} variant="h3">
        {pageTitle}
      </Typography>
      {pageDescription && (
        <Typography className={classes.pageDescription} variant="body2">
          {pageDescription}
        </Typography>
      )}
      {filters && filters}
      <div className={classes.resultsContainer}>
        {props && <ResultsComponent {...props} />}
      </div>
    </div>
  );
}

const useStyles = makeStyles(() => ({
  button: {
    margin: '1rem 1rem 1rem 2rem',
  },
  resultsContainer: {
    margin: '2rem',
  },
  pageTitle: {
    marginLeft: '2rem',
  },
  pageDescription: {
    marginLeft: '2rem',
    marginTop: '0.5em',
  },
}));

export default MonitoringTableWrapper;
