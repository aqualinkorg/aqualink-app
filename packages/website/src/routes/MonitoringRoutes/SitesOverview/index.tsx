import React from 'react';
import monitoringServices from 'services/monitoringServices';
import { BodyCell, HeadCell } from 'common/MonitoringTable';
import { Status } from 'store/Sites/types';
import MonitoringTableWrapper from '../MonitoringTableWrapper';

type TableData = {
  siteId: number;
  siteName: string;
  depth: number;
  status: Status;
  organizations: string;
  adminNames: string;
  spotterId: string;
  videoSteam: string;
  updatedAt: string;
  lastDateReceived: string | null;
};

const headCells: HeadCell<TableData>[] = [
  { id: 'siteId', label: 'Site ID', tooltipText: '' },
  { id: 'siteName', label: 'Site Name', tooltipText: '' },
  { id: 'depth', label: 'Depth', tooltipText: '' },
  { id: 'status', label: 'Status', tooltipText: '' },
  { id: 'organizations', label: 'Organizations', tooltipText: '' },
  { id: 'adminNames', label: 'Admin Names', tooltipText: '' },
  { id: 'spotterId', label: 'Spotter ID', tooltipText: '' },
  { id: 'videoSteam', label: 'Video Steam', tooltipText: '' },
  { id: 'updatedAt', label: 'Updated At', tooltipText: '' },
  { id: 'lastDateReceived', label: 'Last Date Received', tooltipText: '' },
];

const bodyCells: BodyCell<TableData>[] = [
  { id: 'siteId', linkTo: (row) => `/sites/${row.siteId}` },
  { id: 'siteName' },
  { id: 'depth' },
  { id: 'status' },
  { id: 'organizations' },
  { id: 'adminNames' },
  { id: 'spotterId' },
  { id: 'videoSteam' },
  { id: 'updatedAt' },
  { id: 'lastDateReceived' },
];

async function getResult(token: string): Promise<TableData[]> {
  const { data } = await monitoringServices.getSitesOverview({ token });

  return data.map((x) => ({
    ...x,
    organizations: x.organizations.join(', '),
    adminNames: x.adminNames.join(', '),
    adminEmails: x.adminEmails.join(', '),
  }));
}

function SitesOverview() {
  return (
    <MonitoringTableWrapper
      pageTitle="Sites Overview"
      getResult={getResult}
      headCells={headCells}
      bodyCells={bodyCells}
    />
  );
}

export default SitesOverview;
