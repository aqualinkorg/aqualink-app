import {
  TableContainer,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import { reefCheckSurveySelector } from 'store/ReefCheckSurveys/reefCheckSurveySlice';

type ReefCheckSurveyTableProps = {
  category: string;
  description?: string;
  // Filter out rows with 0 values
  hideEmptyRows?: boolean;
};

export const ReefCheckSurveyTable = ({
  category,
  description = '',
  hideEmptyRows,
}: ReefCheckSurveyTableProps) => {
  const { survey, loading, error } = useSelector(reefCheckSurveySelector);
  const rows = survey?.organisms
    .filter((organism) => organism.type === category)
    .map((organism) => ({
      id: organism.organism,
      s1: organism.s1,
      s2: organism.s2,
      s3: organism.s3,
      s4: organism.s4,
      total: organism.s1 + organism.s2 + organism.s3 + organism.s4,
    }));

  const filteredRows = hideEmptyRows
    ? rows?.filter((row) => row.total > 0)
    : rows;

  if (error || !filteredRows) {
    return null;
  }

  if (loading) {
    // TODO: Add skeleton
    return null;
  }

  return (
    <>
      <TableContainer component={Paper} style={{ color: 'black', padding: 16 }}>
        <Typography>{category} Count</Typography>
        <Typography variant="body2">{description}</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{category}</TableCell>
              <TableCell align="center">s1 (0-20m)</TableCell>
              <TableCell align="center">s2 (25-45m)</TableCell>
              <TableCell align="center">s3 (50-70m)</TableCell>
              <TableCell align="center">s4 (75-95m)</TableCell>
              <TableCell align="center">Total</TableCell>
              <TableCell align="center">Per 100m2</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell align="center">{row.s1}</TableCell>
                <TableCell align="center">{row.s2}</TableCell>
                <TableCell align="center">{row.s3}</TableCell>
                <TableCell align="center">{row.s4}</TableCell>
                <TableCell align="center">{row.total}</TableCell>
                <TableCell align="center">-</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
