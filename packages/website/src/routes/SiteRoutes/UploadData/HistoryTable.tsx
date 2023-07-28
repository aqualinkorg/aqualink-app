import React from 'react';
import {
  Button,
  makeStyles,
  Theme,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TypographyProps,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { startCase } from 'lodash';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Site, SiteUploadHistory } from 'store/Sites/types';
import requests from 'helpers/requests';
import { pluralize } from 'helpers/stringUtils';
import DeleteButton from 'common/DeleteButton';

const tableHeaderTitles = [
  'NAME',
  'TIMEZONE',
  'SITE',
  'SURVEY POINT',
  'SENSOR TYPE',
  'UPLOAD DATE',
  'AFFECTED SITE IDS',
  'DATA RANGE',
  '',
];

const tableCellTypographyProps: TypographyProps = {
  color: 'textSecondary',
  variant: 'subtitle2',
};

const HistoryTable = ({ site, uploadHistory, onDelete }: HistoryTableProps) => {
  const nUploads = uploadHistory.length;
  const classes = useStyles();
  const { timezone } = site;
  const timezoneAbbreviation = timezone
    ? moment().tz(timezone).zoneAbbr()
    : undefined;
  const dateFormat = 'MM/DD/YYYY';

  const dataVisualizationButtonLink = (
    start: string,
    end: string,
    surveyPointId?: number,
  ) =>
    `/sites/${site.id}${requests.generateUrlQueryParams({
      start,
      end,
      surveyPoint: surveyPointId,
    })}`;

  if (nUploads === 0) {
    return null;
  }

  return (
    <div className={classes.root}>
      <div>
        <Typography variant="h6" gutterBottom>
          {nUploads} {pluralize(nUploads, 'file')} previously uploaded
        </Typography>
      </div>
      <TableContainer>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              {tableHeaderTitles.map((title) => (
                <TableCell key={title} className={classes.headCell}>
                  <Typography {...tableCellTypographyProps}>{title}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {uploadHistory.map(
              ({ dataUpload, surveyPoint, sitesAffectedByDataUpload }) => {
                const row = [
                  dataUpload.file,
                  timezoneAbbreviation || timezone,
                  site.name,
                  surveyPoint?.name,
                  dataUpload.sensorTypes.map((x) => startCase(x)).join(', '),
                  moment(dataUpload.createdAt).format(dateFormat),
                  sitesAffectedByDataUpload?.join(', '),
                ];
                return (
                  <TableRow key={dataUpload.id}>
                    {row.map((item) => (
                      <TableCell>
                        <Typography {...tableCellTypographyProps}>
                          {item}
                        </Typography>
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        component={Link}
                        to={dataVisualizationButtonLink(
                          dataUpload.minDate,
                          dataUpload.maxDate,
                          surveyPoint?.id,
                        )}
                        size="small"
                        variant="outlined"
                        color="primary"
                        className={classes.dateIntervalButton}
                      >
                        {moment(dataUpload.minDate).format(dateFormat)} -{' '}
                        {moment(dataUpload.maxDate).format(dateFormat)}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <DeleteButton
                        onConfirm={() => onDelete([dataUpload.id])}
                        content={
                          <Typography color="textSecondary">
                            Are you sure you want to delete file &quot;
                            <span className={classes.bold}>
                              {dataUpload.file}
                            </span>
                            &quot;? Data between dates{' '}
                            <span className={classes.bold}>
                              {moment(dataUpload.minDate).format(
                                'MM/DD/YYYY HH:mm',
                              )}
                            </span>{' '}
                            and{' '}
                            <span className={classes.bold}>
                              {moment(dataUpload.maxDate).format(
                                'MM/DD/YYYY HH:mm',
                              )}
                            </span>{' '}
                            will be lost.
                          </Typography>
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              },
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  table: {
    minWidth: 1080,
  },
  headCell: {
    backgroundColor: grey[200],
  },
  bold: {
    fontWeight: 700,
  },
  dateIntervalButton: {
    whiteSpace: 'nowrap',
  },
}));

interface HistoryTableProps {
  site: Site;
  uploadHistory: SiteUploadHistory;
  onDelete: (ids: number[]) => Promise<void>;
}

export default HistoryTable;
