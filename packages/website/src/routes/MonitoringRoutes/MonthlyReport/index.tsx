import { Button, makeStyles } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import monitoringServices, {
  GetMonitoringMetricsResponse,
  MonitoringData,
} from 'services/monitoringServices';
import { useSelector } from 'react-redux';
import { userInfoSelector } from 'store/User/userSlice';
import { useSnackbar } from 'notistack';
import MonitoringTable, { BodyCell, HeadCell } from 'common/MonitoringTable';
import LoadingBackdrop from 'common/LoadingBackdrop';
import { ArrayElement } from 'utils/types';
import { fetchData } from '../utils';

type TableData = Omit<ArrayElement<GetMonitoringMetricsResponse>, 'data'> &
  Omit<MonitoringData, 'date'>;

const headCells: HeadCell<TableData>[] = [
  { id: 'siteId', label: 'Site ID', tooltipText: '' },
  { id: 'siteName', label: 'Site Name', tooltipText: '' },
  { id: 'totalRequests', label: 'Total Requests', tooltipText: '' },
  {
    id: 'registeredUserRequests',
    label: 'Registered Users Requests',
    tooltipText: '',
  },
  {
    id: 'siteAdminRequests',
    label: 'Site Admin Requests',
    tooltipText: '',
  },
  {
    id: 'timeSeriesRequests',
    label: 'Site Visits',
    tooltipText: '',
  },
  {
    id: 'CSVDownloadRequests',
    label: 'CSV Downloads',
    tooltipText: '',
  },
];

const bodyCells: BodyCell<TableData>[] = [
  { id: 'siteId', linkTo: (row) => `/sites/${row.siteId}` },
  { id: 'siteName' },
  { id: 'totalRequests' },
  { id: 'registeredUserRequests' },
  { id: 'siteAdminRequests' },
  { id: 'timeSeriesRequests' },
  { id: 'CSVDownloadRequests' },
];

function transformData(data: GetMonitoringMetricsResponse): TableData[] {
  return data.map(
    ({
      data: [
        {
          CSVDownloadRequests = 0,
          registeredUserRequests = 0,
          siteAdminRequests = 0,
          timeSeriesRequests = 0,
          totalRequests = 0,
        } = {},
      ] = [],
      siteId,
      siteName,
    }) => ({
      siteId,
      siteName,
      CSVDownloadRequests,
      registeredUserRequests,
      siteAdminRequests,
      timeSeriesRequests,
      totalRequests,
    }),
  );
}

function MonthlyReport() {
  const user = useSelector(userInfoSelector);
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [result, setResult] =
    React.useState<GetMonitoringMetricsResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  function onGetMetrics() {
    fetchData({
      user,
      enqueueSnackbar,
      setLoading,
      setResult,
      getResult: async (token) =>
        (
          await monitoringServices.getMonitoringLastMonth({
            token,
          })
        ).data,
    });
  }

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
        Get metrics
      </Button>
      <div className={classes.resultsContainer}>
        {result && (
          <MonitoringTable
            headCells={headCells}
            data={transformData(result)}
            bodyCells={bodyCells}
          />
        )}
      </div>
    </div>
  );
}

const useStyles = makeStyles(() => ({
  button: {
    margin: '1rem',
  },
  resultsContainer: {
    margin: '2rem',
  },
}));

export default MonthlyReport;
