import React from 'react';
import monitoringServices from 'services/monitoringServices';
import { BodyCell, HeadCell } from 'common/MonitoringTable';
import { Status } from 'store/Sites/types';
import { makeStyles, TextField } from '@material-ui/core';
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

function SitesOverview() {
  const classes = useStyles();

  const [siteId, setSiteId] = React.useState<string>('');
  const [siteName, setSiteName] = React.useState<string>('');
  const [spotterId, setSpotterId] = React.useState<string>('');
  const [organization, setOrganization] = React.useState<string>('');
  const [adminEmail, setAdminEmail] = React.useState<string>('');
  const [adminUserName, setAdminUserName] = React.useState<string>('');

  const textFilters = [
    { label: 'Site ID', value: siteId, setValue: setSiteId },
    { label: 'Site Name', value: siteName, setValue: setSiteName },
    { label: 'Spotter ID', value: spotterId, setValue: setSpotterId },
    { label: 'Organization', value: organization, setValue: setOrganization },
    { label: 'Admin Email', value: adminEmail, setValue: setAdminEmail },
    {
      label: 'Admin Username',
      value: adminUserName,
      setValue: setAdminUserName,
    },
  ];

  const filters = (
    <div className={classes.filtersWrapper}>
      {textFilters.map((elem) => (
        <TextField
          className={classes.filterItem}
          variant="outlined"
          label={elem.label}
          value={elem.value}
          onChange={(e) => elem.setValue(e.target.value)}
        />
      ))}
    </div>
  );

  const getResult = React.useCallback(
    async (token: string) => {
      const { data } = await monitoringServices.getSitesOverview({
        token,
        ...(siteId ? { siteId: Number(siteId) } : {}),
        ...(spotterId ? { spotterId } : {}),
        ...(siteName ? { siteName } : {}),
        ...(organization ? { organization } : {}),
        ...(adminEmail ? { adminEmail } : {}),
        ...(adminUserName ? { adminUserName } : {}),
      });

      return data.map((x) => ({
        ...x,
        organizations: x.organizations.join(', '),
        adminNames: x.adminNames.join(', '),
        adminEmails: x.adminEmails.join(', '),
      }));
    },
    [adminEmail, adminUserName, organization, siteId, siteName, spotterId],
  );

  return (
    <MonitoringTableWrapper
      pageTitle="Sites Overview"
      getResult={getResult}
      headCells={headCells}
      bodyCells={bodyCells}
      filters={filters}
    />
  );
}

const useStyles = makeStyles(() => ({
  filtersWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: '2rem',
    padding: '2rem',
    flexBasis: '5rem',
  },
  filterItem: {
    height: '3rem',
  },
}));

export default SitesOverview;
