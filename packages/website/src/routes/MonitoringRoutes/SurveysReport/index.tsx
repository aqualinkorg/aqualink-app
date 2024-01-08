import MonitoringTable, {
  BodyCell,
  HeadCell,
  MonitoringTableProps,
} from 'common/MonitoringTable';
import { DateTime } from 'luxon';
import React from 'react';
import monitoringServices, {
  GetSurveysReportResponse,
} from 'services/monitoringServices';
import { ArrayElement } from 'utils/types';
import MonitoringPageWrapper from '../MonitoringPageWrapper';

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
  { id: 'siteId', linkTo: (row) => `/sites/${encodeURIComponent(row.siteId)}` },
  { id: 'siteName' },
  { id: 'diveDate' },
  {
    id: 'surveyId',
    linkTo: (row) =>
      `/sites/${encodeURIComponent(
        row.siteId,
      )}/survey_details/${encodeURIComponent(row.surveyId)}`,
  },
  { id: 'updatedAt' },
  { id: 'surveyMediaCount' },
  { id: 'userEmail' },
  { id: 'userFullName' },
];

async function getResult(token: string): Promise<TableData[]> {
  const { data } = await monitoringServices.getSurveysReport({
    token,
  });
  return data;
}

function SurveysReport() {
  return (
    <MonitoringPageWrapper<TableData[], MonitoringTableProps<TableData>>
      pageTitle="Surveys Report"
      getResult={getResult}
      ResultsComponent={MonitoringTable}
      resultsComponentProps={(result) => ({
        headCells,
        data: result,
        bodyCells,
        defaultOrder: 'desc',
        defaultSortColumn: 'diveDate',
        downloadCsvFilename: `surveys-report-${DateTime.now().toFormat(
          'yyyy-MM-dd',
        )}.csv`,
      })}
      fetchOnPageLoad
    />
  );
}

export default SurveysReport;
