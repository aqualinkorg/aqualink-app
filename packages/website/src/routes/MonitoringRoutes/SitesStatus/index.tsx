import { BodyCell, HeadCell } from 'common/MonitoringTable';
import React from 'react';
import monitoringServices, {
  GetSitesStatusResponse,
} from 'services/monitoringServices';
import MonitoringTableWrapper from '../MonitoringTableWrapper';

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
    <MonitoringTableWrapper
      pageTitle="Sites Status"
      getResult={getResult}
      headCells={headCells}
      bodyCells={bodyCells}
    />
  );
}

export default SitesStatus;
