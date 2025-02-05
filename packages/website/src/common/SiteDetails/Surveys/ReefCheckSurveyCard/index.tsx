import React from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
} from '@mui/material';
import { createStyles, WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import { groupBy, times } from 'lodash';
import { Link } from 'react-router-dom';
import cls from 'classnames';
import { reefCheckImpactRows, ReefCheckSurvey } from 'store/ReefCheckSurveys';
import reefCheckLogo from '../../../../assets/img/reef-check-logo.png';

type ReefCheckSurveyCardIncomingProps = {
  survey: ReefCheckSurvey;
};

const ReefCheckSurveyCardComponent = ({
  survey,
  classes,
}: ReefCheckSurveyCardProps) => {
  const stats = groupBy(
    // eslint-disable-next-line fp/no-mutating-methods
    survey.organisms
      .map((organism) => ({
        ...organism,
        count: organism.s1 + organism.s2 + organism.s3 + organism.s4,
      }))
      .filter(
        ({ count, type }) =>
          // Filter out fish and invertebrates with no count
          count > 0 || type === 'Impact' || type === 'Bleaching',
      )
      .sort((a, b) => b.count - a.count),
    ({ type, organism }) => {
      if (type === 'Impact') {
        return reefCheckImpactRows.includes(organism) ? 'Impact' : 'Bleaching';
      }
      return type;
    },
  );

  const rowCount = Math.max(
    stats.Fish?.length ?? 0,
    stats.Invertebrate?.length ?? 0,
    stats.Bleaching?.length ?? 0,
    stats.Impact?.length ?? 0,
  );

  return (
    <Paper className={classes.paper}>
      <Box display="flex" justifyContent="space-between">
        <Box display="flex" gap={2}>
          <Typography>
            Date: {new Date(survey.date).toLocaleString()}
          </Typography>
          <Typography>Depth: {survey.depth}m</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography>
            {survey.teamLeader
              ? `${survey.teamLeader}, Reef Check`
              : 'Reef Check'}
          </Typography>
          <img
            src={reefCheckLogo}
            alt="Reef Check Logo"
            style={{ height: 20 }}
          />
        </Box>
      </Box>
      <TableContainer className={classes.tableRoot}>
        <Table size="small">
          <TableHead>
            <TableRow className={classes.header}>
              <TableCell className={classes.label}>
                FISH ({stats.Fish?.length ?? 0})
              </TableCell>
              <TableCell>Count</TableCell>
              <TableCell className={cls(classes.label, classes.noWrap)}>
                INVERTEBRATES ({stats.Invertebrate?.length ?? 0})
              </TableCell>
              <TableCell>Count</TableCell>
              <TableCell className={classes.label}>
                BLEACHING AND CORAL DISEASES
              </TableCell>
              <TableCell>YES/NO</TableCell>
              <TableCell className={classes.label}>IMPACT</TableCell>
              <TableCell>YES/NO</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {times(rowCount).map((i) => (
              <TableRow key={i}>
                <TableCell className={classes.label}>
                  {stats.Fish?.[i]?.organism}
                </TableCell>
                <TableCell>{stats.Fish?.[i]?.count}</TableCell>
                <TableCell className={classes.label}>
                  {stats.Invertebrate?.[i]?.organism}
                </TableCell>
                <TableCell>{stats.Invertebrate?.[i]?.count}</TableCell>
                <TableCell className={classes.label}>
                  {stats.Bleaching?.[i]?.organism}
                </TableCell>
                <TableCell>
                  {formatImpactCount(stats.Bleaching?.[i]?.count)}
                </TableCell>
                <TableCell className={classes.label}>
                  {stats.Impact?.[i]?.organism}
                </TableCell>
                <TableCell>
                  {formatImpactCount(stats.Impact?.[i]?.count)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box marginTop={2}>
        <Link to={`reef_check_survey/${survey.id}`}>
          <Button size="small" variant="outlined" color="primary">
            VIEW DETAILS
          </Button>
        </Link>
      </Box>
    </Paper>
  );
};

const formatImpactCount = (count?: number) => {
  if (count === undefined) {
    return '';
  }
  return count > 0 ? 'YES' : 'NO';
};

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      padding: 16,
      color: theme.palette.text.secondary,
      maxWidth: '100%',
    },
    label: {
      backgroundColor: '#FAFAFA',
    },
    tableRoot: {
      maxHeight: 200,
    },
    header: {
      '& th': {
        borderBottom: '1px solid black',
      },
    },
    noWrap: {
      whiteSpace: 'nowrap',
    },
  });

type ReefCheckSurveyCardProps = ReefCheckSurveyCardIncomingProps &
  WithStyles<typeof styles>;

export const ReefCheckSurveyCard = withStyles(styles)(
  ReefCheckSurveyCardComponent,
);
