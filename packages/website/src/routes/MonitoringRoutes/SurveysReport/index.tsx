import { BodyCell, HeadCell } from 'common/MonitoringTable';
import { DateTime } from 'luxon';
import React from 'react';
import monitoringServices, {
  GetSurveysReportResponse,
} from 'services/monitoringServices';
import { ArrayElement } from 'utils/types';
import MonitoringTableWrapper from '../MonitoringTableWrapper';

type TableData = ArrayElement<GetSurveysReportResponse>;

const headCells: HeadCell<TableData>[] = [
  { id: 'siteId', label: 'Site ID', tooltipText: '' },
  { id: 'siteName', label: 'Site Name', tooltipText: '' },
  { id: 'diveDate', label: 'Dive Date', tooltipText: '' },
  { id: 'surveyId', label: 'Survey ID', tooltipText: '' },
  { id: 'updatedAt', label: 'Updated At', tooltipText: '' },
  { id: 'surveyMediaCount', label: 'Number of Survey Media', tooltipText: '' },
  { id: 'userEmail', label: 'User Email', tooltipText: '' },
  { id: 'userFullName', label: 'User Name', tooltipText: '' },
];

const bodyCells: BodyCell<TableData>[] = [
  { id: 'siteId', linkTo: (row) => `/sites/${row.siteId}` },
  { id: 'siteName' },
  {
    id: 'diveDate',
    format: (row) =>
      DateTime.fromISO(row.diveDate).toFormat('yyyy-MM-dd HH:mm:ss'),
  },
  {
    id: 'surveyId',
    linkTo: (row) => `/sites/${row.siteId}/survey_details/${row.surveyId}`,
  },
  { id: 'updatedAt' },
  { id: 'surveyMediaCount' },
  { id: 'userEmail' },
  { id: 'userFullName' },
];

async function getResult(token: string) {
  const { data } = await monitoringServices.getSurveysReport({
    token,
  });
  return data;
}

function SurveysReport() {
  return (
    <MonitoringTableWrapper
      pageTitle="Surveys Report"
      getResult={getResult}
      headCells={headCells}
      bodyCells={bodyCells}
    />
  );
}

export default SurveysReport;
