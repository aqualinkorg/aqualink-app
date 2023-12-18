import { Button, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useSelector } from 'react-redux';
import { userInfoSelector } from 'store/User/userSlice';
import { useSnackbar } from 'notistack';
import MonitoringTable, {
  BodyCell,
  HeadCell,
  Order,
} from 'common/MonitoringTable';
import LoadingBackdrop from 'common/LoadingBackdrop';
import { fetchData } from './utils';

interface MonitoringTableWrapperProps<T> {
  getResult: (token: string) => Promise<T[]>;
  headCells: HeadCell<T>[];
  bodyCells: BodyCell<T>[];
  pageTitle: string;
  filters?: React.JSX.Element;
  defaultSortColumn?: keyof T;
  defaultOrder?: Order;
  fetchOnEnter?: boolean;
}

function MonitoringTableWrapper<
  T extends { [key in keyof T]: string | number | null },
>({
  getResult,
  headCells,
  bodyCells,
  pageTitle,
  filters,
  defaultSortColumn,
  defaultOrder,
  fetchOnEnter = false,
}: MonitoringTableWrapperProps<T>) {
  const user = useSelector(userInfoSelector);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [result, setResult] = React.useState<T[] | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    onGetMetrics();
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
      {filters && filters}
      <div className={classes.resultsContainer}>
        {result && (
          <MonitoringTable
            headCells={headCells}
            data={result}
            bodyCells={bodyCells}
            defaultSortColumn={defaultSortColumn}
            defaultOrder={defaultOrder}
          />
        )}
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
}));

export default MonitoringTableWrapper;
