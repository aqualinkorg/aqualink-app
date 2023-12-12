import React from 'react';
import monitoringServices, {
  GetMonitoringMetricsResponse,
  MonitoringData,
} from 'services/monitoringServices';
import { BodyCell, HeadCell } from 'common/MonitoringTable';
import { ArrayElement } from 'utils/types';
import MonitoringTableWrapper from '../MonitoringTableWrapper';

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

async function getResult(token: string) {
  const { data } = await monitoringServices.getMonitoringLastMonth({
    token,
  });

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
  return (
    <MonitoringTableWrapper
      getResult={getResult}
      headCells={headCells}
      bodyCells={bodyCells}
    />
  );
}

export default MonthlyReport;
