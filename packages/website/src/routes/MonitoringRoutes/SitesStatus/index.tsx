import MonitoringTable, {
  BodyCell,
  HeadCell,
  MonitoringTableProps,
} from 'common/MonitoringTable';
import { DateTime } from 'luxon';
import React from 'react';
import monitoringServices, {
  GetSitesStatusResponse,
} from 'services/monitoringServices';
import MonitoringPageWrapper from '../MonitoringPageWrapper';

type TableData = GetSitesStatusResponse;

const headCells: HeadCell<TableData>[] = [
  { id: 'totalSites', label: 'Total Sites', tooltipText: '' },
  { id: 'deployed', label: 'Deployed', tooltipText: '' },
  { id: 'displayed', label: 'Displayed', tooltipText: '' },
  { id: 'maintenance', label: 'Maintenance', tooltipText: '' },
  { id: 'shipped', label: 'Shipped', tooltipText: '' },
  { id: 'endOfLife', label: 'End of Life', tooltipText: '' },
  { id: 'lost', label: 'Lost', tooltipText: '' },
];

const bodyCells: BodyCell<TableData>[] = [
  { id: 'totalSites' },
  { id: 'deployed' },
  { id: 'displayed' },
  { id: 'maintenance' },
  { id: 'shipped' },
  { id: 'endOfLife' },
  { id: 'lost' },
];

async function getResult(token: string): Promise<TableData[]> {
  const { data } = await monitoringServices.getSitesStatus({
    token,
  });
  return [data];
}

function SitesStatus() {
  return (
    <MonitoringPageWrapper<TableData[], MonitoringTableProps<TableData>>
      pageTitle="Sites Status"
      getResult={getResult}
      ResultsComponent={MonitoringTable}
      resultsComponentProps={(result) => ({
        headCells,
        data: result,
        bodyCells,
        downloadCsvFilename: `sites-status-${DateTime.now().toFormat(
          'yyyy-MM-dd',
        )}.csv`,
      })}
      fetchOnPageLoad
    />
  );
}

export default SitesStatus;
