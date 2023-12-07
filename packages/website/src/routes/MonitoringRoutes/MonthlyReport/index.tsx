import {
  Backdrop,
  Button,
  CircularProgress,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import monitoringServices, {
  GetMonitoringMetricsResponse,
} from 'services/monitoringServices';
import { useSelector } from 'react-redux';
import { userInfoSelector } from 'store/User/userSlice';
import { useSnackbar } from 'notistack';
import MonitoringTable, { BodyCell, HeadCell } from 'common/MonitoringTable';
import { fetchData } from '../utils';

interface TableData {
  column1: string;
  column2: string;
  column3: string;
}

const data: TableData[] = [
  { column1: 'Value11', column2: 'Value12', column3: 'Value13' },
  { column1: 'Value21', column2: 'Value22', column3: 'Value23' },
  { column1: 'Value31', column2: 'Value32', column3: 'Value33' },
  { column1: 'Value41', column2: 'Value42', column3: 'Value43' },
  { column1: 'Value51', column2: 'Value52', column3: 'Value53' },
  { column1: 'Value61', column2: 'Value62', column3: 'Value63' },
];

const headCells: HeadCell<TableData>[] = [
  { id: 'column1', label: 'Column 1', tooltipText: 'This is column 1' },
  { id: 'column2', label: 'Column 2', tooltipText: 'This is column 2' },
  { id: 'column3', label: 'Column 3', tooltipText: 'This is column 3' },
];

const bodyCells: BodyCell<TableData>[] = [
  {
    id: 'column1',
    linkTo: 'google.com',
  },
  {
    id: 'column2',
  },
  {
    id: 'column3',
  },
];

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
      <Backdrop open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
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
      <>
        <MonitoringTable
          defaultSortColumn="column2"
          headCells={headCells}
          data={data}
          bodyCells={bodyCells}
        />
        <div style={{ height: '100%', display: 'flex', flexDirection: 'row' }}>
          <div className={classes.resultsContainer}>
            <TableContainer style={{ width: '80%' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.headCell}>Site ID</TableCell>
                    <TableCell className={classes.headCell} align="right">
                      Site Name
                    </TableCell>
                    <TableCell className={classes.headCell} align="right">
                      Total Requests
                    </TableCell>
                    <TableCell className={classes.headCell} align="right">
                      Registered Users Requests
                    </TableCell>
                    <TableCell className={classes.headCell} align="right">
                      Site Admin Requests
                    </TableCell>
                    <TableCell className={classes.headCell} align="right">
                      Site Visits
                    </TableCell>
                    <TableCell className={classes.headCell} align="right">
                      CSV Downloads
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result !== null &&
                    result.map(
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
                      }) => (
                        <TableRow key={siteId}>
                          <TableCell
                            className={classes.cell}
                            component="th"
                            scope="row"
                          >
                            {siteId}
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            {siteName}
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            {totalRequests}
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            {registeredUserRequests}
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            {siteAdminRequests}
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            {timeSeriesRequests}
                          </TableCell>
                          <TableCell className={classes.cell} align="right">
                            {CSVDownloadRequests}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </>
    </div>
  );
}

const useStyles = makeStyles(() => ({
  button: {
    margin: '1rem',
  },
  resultsContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '8rem',
    width: '100%',
  },
  headCell: {
    fontWeight: 'bold',
    color: 'black',
  },
  cell: {
    color: 'black',
  },
}));

export default MonthlyReport;
