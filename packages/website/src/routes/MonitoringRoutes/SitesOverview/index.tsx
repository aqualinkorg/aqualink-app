import React from 'react';
import monitoringServices from 'services/monitoringServices';
import MonitoringTable, {
  BodyCell,
  HeadCell,
  MonitoringTableProps,
} from 'common/MonitoringTable';
import { Status } from 'store/Sites/types';
import { TextField } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import StatusSelector from 'common/StatusSelector';
import { DateTime } from 'luxon';
import MonitoringPageWrapper from '../MonitoringPageWrapper';
import { includes } from '../utils';

type TableData = {
  siteId: number;
  siteName: string | null;
  depth: number | null;
  status: Status;
  organizations: string;
  adminNames: string;
  adminEmails: string;
  spotterId: string | null;
  videoStream: string | null;
  updatedAt: string;
  lastDataReceived: string | null;
  surveysCount: number;
  contactInformation: string | null;
  createdAt: string;
};

const headCells: HeadCell<TableData>[] = [
  { id: 'siteId', label: 'Site ID', tooltipText: '' },
  { id: 'createdAt', label: 'Created At', tooltipText: '' },
  { id: 'siteName', label: 'Site Name', tooltipText: '' },
  { id: 'depth', label: 'Depth', tooltipText: '' },
  { id: 'status', label: 'Status', tooltipText: '' },
  { id: 'organizations', label: 'Organizations', tooltipText: '' },
  { id: 'adminNames', label: 'Admin', tooltipText: '' },
  { id: 'adminEmails', label: 'Admin Emails', tooltipText: '' },
  { id: 'spotterId', label: 'Spotter ID', tooltipText: '' },
  { id: 'videoStream', label: 'Video Steam', tooltipText: '' },
  { id: 'updatedAt', label: 'Updated At', tooltipText: '' },
  { id: 'lastDataReceived', label: 'Last Data Received', tooltipText: '' },
  { id: 'surveysCount', label: 'Number of Surveys', tooltipText: '' },
  { id: 'contactInformation', label: 'Contact Information', tooltipText: '' },
];

const bodyCells: BodyCell<TableData>[] = [
  { id: 'siteId', linkTo: (row) => `/sites/${encodeURIComponent(row.siteId)}` },
  {
    id: 'createdAt',
    format: (row) => DateTime.fromISO(row.createdAt).toFormat('yyyy-MM-dd'),
  },
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
  { id: 'contactInformation' },
];

const getUniqueValues = (arr: Array<string | null>) =>
  [...new Set(arr)].filter(Boolean).join(', ');

const getResult = async (token: string) => {
  const { data } = await monitoringServices.getSitesOverview({ token });

  return data.map((x) => ({
    ...x,
    organizations: getUniqueValues(x.organizations),
    adminNames: getUniqueValues(x.adminNames),
    adminEmails: getUniqueValues(x.adminEmails),
  }));
};

function SitesOverview() {
  const classes = useStyles();

  const [siteId, setSiteId] = React.useState<string>('');
  const [siteName, setSiteName] = React.useState<string>('');
  const [spotterId, setSpotterId] = React.useState<string>('');
  const [organization, setOrganization] = React.useState<string>('');
  const [adminEmail, setAdminEmail] = React.useState<string>('');
  const [adminUsername, setAdminUsername] = React.useState<string>('');
  const [status, setStatus] = React.useState<Status | ''>('');

  const textFilters = [
    { label: 'Site ID', value: siteId, setValue: setSiteId },
    { label: 'Site Name', value: siteName, setValue: setSiteName },
    { label: 'Spotter ID', value: spotterId, setValue: setSpotterId },
    { label: 'Organization', value: organization, setValue: setOrganization },
    { label: 'Admin Email', value: adminEmail, setValue: setAdminEmail },
    {
      label: 'Admin Name',
      value: adminUsername,
      setValue: setAdminUsername,
    },
  ];

  const filters = (
    <div className={classes.filtersWrapper}>
      {textFilters.map((elem) => (
        <TextField
          key={elem.label}
          className={classes.filterItem}
          variant="outlined"
          label={elem.label}
          value={elem.value}
          onChange={(e) => elem.setValue(e.target.value)}
        />
      ))}
      <StatusSelector
        status={status}
        onChange={(e) => setStatus(e.target.value as Status | '')}
        textFieldStyle={classes.filterItem}
      />
    </div>
  );

  return (
    <MonitoringPageWrapper<TableData[], MonitoringTableProps<TableData>>
      pageTitle="Sites Overview"
      ResultsComponent={MonitoringTable}
      resultsComponentProps={(result) => ({
        headCells,
        data: result.filter((x) => {
          const siteFilter = siteId ? x.siteId === Number(siteId) : true;
          const spotterIdFilter = includes(x.spotterId, spotterId);
          const siteNameFilter = includes(x.siteName, siteName);
          const organizationFilter = includes(x.organizations, organization);
          const adminEmailFilter = includes(x.adminEmails, adminEmail);
          const adminUsernameFilter = includes(x.adminNames, adminUsername);
          const statusFilter = status ? x.status === status : true;

          return (
            siteFilter &&
            spotterIdFilter &&
            siteNameFilter &&
            organizationFilter &&
            adminEmailFilter &&
            adminUsernameFilter &&
            statusFilter
          );
        }),
        bodyCells,
        defaultSortColumn: 'createdAt',
        defaultOrder: 'desc',
        downloadCsvFilename: `sites-overview-${DateTime.now().toFormat(
          'yyyy-MM-dd',
        )}.csv`,
      })}
      getResult={getResult}
      filters={filters}
      fetchOnPageLoad
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
