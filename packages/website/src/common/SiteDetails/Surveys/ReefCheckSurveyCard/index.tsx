import React from 'react';
import {
  Box,
  Button,
  createStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import { reefCheckImpactRows, ReefCheckSurvey } from 'store/ReefCheckSurveys';
import { groupBy, times } from 'lodash';
import { Link } from 'react-router-dom';

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
      .sort((a, b) => b.count - a.count),
    ({ type, organism }) => {
      if (type === 'Impact') {
        return reefCheckImpactRows.includes(organism) ? 'Impact' : 'Bleaching';
      }
      return type;
    },
  );

  return (
    <Paper className={classes.paper}>
      <Box display="flex" justifyContent="space-between">
        <Typography>Date: {new Date(survey.date).toLocaleString()}</Typography>
        {survey.submittedBy && (
          <Typography>User: {survey.submittedBy}</Typography>
        )}
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow className={classes.header}>
              <TableCell className={classes.label}>
                FISH ({stats.Fish?.length ?? 0})
              </TableCell>
              <TableCell>Count</TableCell>
              <TableCell className={classes.label}>
                INVERTEBRATES ({stats.Invertebrate?.length ?? 0})
              </TableCell>
              <TableCell>Count</TableCell>
              <TableCell className={classes.label}>
                BLEACHING AND CORAL DIDEASES ({stats.Bleaching?.length ?? 0})
              </TableCell>
              <TableCell>YES/NO</TableCell>
              <TableCell className={classes.label}>
                IMPACT ({stats.Impact?.length ?? 0})
              </TableCell>
              <TableCell>YES/NO</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {times(3).map((i) => (
              <TableRow key={i}>
                <TableCell className={classes.label}>
                  {stats.Fish?.[i].organism ?? '-'}
                </TableCell>
                <TableCell>{stats.Fish?.[i].count ?? '-'}</TableCell>
                <TableCell className={classes.label}>
                  {stats.Invertebrate?.[i].organism ?? '-'}
                </TableCell>
                <TableCell>{stats.Invertebrate?.[i].count ?? '-'}</TableCell>
                <TableCell className={classes.label}>
                  {stats.Bleaching?.[i].organism ?? '-'}
                </TableCell>
                <TableCell>{stats.Bleaching?.[i].count ?? '-'}</TableCell>
                <TableCell className={classes.label}>
                  {stats.Impact?.[i].organism ?? '-'}
                </TableCell>
                <TableCell>{stats.Impact?.[i].count ?? '-'}</TableCell>
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

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      padding: 16,
      color: theme.palette.text.secondary,
      maxWidth: '100%',
    },
    label: {
      backgroundColor: '#FAFAFA',
      minWidth: 200,
    },
    header: {
      '& th': {
        borderBottom: '1px solid black',
      },
    },
  });

type ReefCheckSurveyCardProps = ReefCheckSurveyCardIncomingProps &
  WithStyles<typeof styles>;

export const ReefCheckSurveyCard = withStyles(styles)(
  ReefCheckSurveyCardComponent,
);
