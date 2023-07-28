import {
  Box,
  Collapse,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import React from 'react';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { SurveyPoints } from 'store/Sites/types';

interface TableCellWrapProps extends TableCellProps {
  bigText?: boolean;
}

export function TableCellWrap({
  bigText = false,
  children,
  ...rest
}: TableCellWrapProps) {
  return (
    <TableCell {...rest}>
      <Typography
        variant={bigText ? 'h6' : 'subtitle1'}
        style={{ color: 'black' }}
        noWrap
      >
        {children}
      </Typography>
    </TableCell>
  );
}

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
  collapseWrap: { paddingBottom: 0, paddingTop: 0 },
});

export function CollapsibleTableRow(props: {
  row: {
    siteName: string | null;
    siteId: number;
    surveyPoints?: SurveyPoints[];
  };
}) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();

  return (
    <>
      <TableRow className={classes.root}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            disabled={!row.surveyPoints || row.surveyPoints.length === 0}
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCellWrap align="left" component="th" scope="row">
          {row.siteName}
        </TableCellWrap>
        <TableCellWrap align="right">{row.siteId}</TableCellWrap>
      </TableRow>
      <TableRow>
        <TableCell className={classes.collapseWrap} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography
                variant="h6"
                gutterBottom
                component="div"
                style={{ color: 'black' }}
              >
                Survey Points
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCellWrap bigText>Name</TableCellWrap>
                    <TableCellWrap bigText>ID</TableCellWrap>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.surveyPoints?.map((point) => (
                    <TableRow key={point.id}>
                      <TableCellWrap align="left" component="th" scope="row">
                        {point.name}
                      </TableCellWrap>
                      <TableCellWrap align="left" component="th" scope="row">
                        {point.id}
                      </TableCellWrap>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
