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
  adminEmails: string;
  spotterId: string;
  videoStream: string;
  updatedAt: string;
  lastDataReceived: string | null;
  surveysCount: number;
};

const headCells: HeadCell<TableData>[] = [
  { id: 'siteId', label: 'Site ID', tooltipText: '' },
  { id: 'siteName', label: 'Site Name', tooltipText: '' },
  { id: 'depth', label: 'Depth', tooltipText: '' },
  { id: 'status', label: 'Status', tooltipText: '' },
  { id: 'organizations', label: 'Organizations', tooltipText: '' },
  { id: 'adminNames', label: 'Admin Names', tooltipText: '' },
  { id: 'adminEmails', label: 'Admin Names', tooltipText: '' },
  { id: 'spotterId', label: 'Spotter ID', tooltipText: '' },
  { id: 'videoStream', label: 'Video Steam', tooltipText: '' },
  { id: 'updatedAt', label: 'Updated At', tooltipText: '' },
  { id: 'lastDataReceived', label: 'Last Date Received', tooltipText: '' },
  { id: 'surveysCount', label: 'Number of Surveys', tooltipText: '' },
];

const bodyCells: BodyCell<TableData>[] = [
  { id: 'siteId', linkTo: (row) => `/sites/${row.siteId}` },
  { id: 'siteName' },
  { id: 'depth' },
  { id: 'status' },
  { id: 'organizations' },
  { id: 'adminNames' },
  { id: 'adminEmails' },
  { id: 'spotterId' },
  { id: 'videoStream' },
  { id: 'updatedAt' },
  { id: 'lastDataReceived' },
  { id: 'surveysCount' },
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
