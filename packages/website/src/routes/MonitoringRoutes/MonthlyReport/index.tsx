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
import { fetchData } from '../utils';

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
        get metrics
      </Button>
      <>
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
                    result.map((row) => (
                      <TableRow key={row.siteId}>
                        <TableCell
                          className={classes.cell}
                          component="th"
                          scope="row"
                        >
                          {row.siteId}
                        </TableCell>
                        <TableCell className={classes.cell} align="right">
                          {row.siteName}
                        </TableCell>
                        <TableCell className={classes.cell} align="right">
                          {row.data[0]?.totalRequests || 0}
                        </TableCell>
                        <TableCell className={classes.cell} align="right">
                          {row.data[0]?.registeredUserRequests || 0}
                        </TableCell>
                        <TableCell className={classes.cell} align="right">
                          {row.data[0]?.siteAdminRequests || 0}
                        </TableCell>
                        <TableCell className={classes.cell} align="right">
                          {row.data[0]?.timeSeriesRequests || 0}
                        </TableCell>
                        <TableCell className={classes.cell} align="right">
                          {row.data[0]?.CSVDownloadRequests || 0}
                        </TableCell>
                      </TableRow>
                    ))}
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
