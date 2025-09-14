import React from 'react';
import {
  Button,
  Theme,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TypographyProps,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { grey } from '@mui/material/colors';
import { startCase } from 'lodash';
import { Link } from 'react-router-dom';
import { Site, SiteUploadHistory } from 'store/Sites/types';
import requests from 'helpers/requests';
import { pluralize } from 'helpers/stringUtils';
import DeleteButton from 'common/DeleteButton';
import { DateTime } from 'luxon-extensions';

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

function HistoryTable({ site, uploadHistory, onDelete }: HistoryTableProps) {
  const nUploads = uploadHistory.length;
  const classes = useStyles();
  const { timezone } = site;
  const timezoneAbbreviation = timezone
    ? DateTime.local().setZone(timezone).toFormat('zzz')
    : undefined;
  const dateFormat = 'LL/dd/yyyy';

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
                  DateTime.fromISO(dataUpload.createdAt).toFormat(dateFormat),
                  sitesAffectedByDataUpload?.join(', '),
                ];
                return (
                  <TableRow key={dataUpload.id}>
                    {row.map((item) => (
                      <TableCell key={`${dataUpload.id}_${item}`}>
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
                        {DateTime.fromISO(dataUpload.minDate).toFormat(
                          dateFormat,
                        )}{' '}
                        -{' '}
                        {DateTime.fromISO(dataUpload.maxDate).toFormat(
                          dateFormat,
                        )}
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
                              {DateTime.fromISO(dataUpload.minDate).toFormat(
                                'LL/dd/yyyy HH:mm',
                              )}
                            </span>{' '}
                            and{' '}
                            <span className={classes.bold}>
                              {DateTime.fromISO(dataUpload.maxDate).toFormat(
                                'LL/dd/yyyy HH:mm',
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
}

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
