import {
  Box,
  Chip,
  Collapse,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableCellProps,
  TableHead,
  TableRow,
  TextFieldProps,
  Theme,
  Typography,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
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

interface SelectOption {
  id: number;
  name: string | null;
  label?: string;
}

type EnhancedSelectOption = SelectOption & { disabled?: boolean };

export const SENSOR_TYPES: EnhancedSelectOption[] = [
  { id: 5, name: 'sheet_data', label: 'Default' },
  { id: 0, name: 'sonde', label: 'Sonde data' },
  { id: 1, name: 'metlog', label: 'Meteorological data' },
  { id: 3, name: 'hobo', label: 'HOBO data' },
  { id: 4, name: 'hui', label: 'HUI data' },
  { id: 2, name: 'spotter', label: 'Spotter data', disabled: true },
];

const OptionsListStyles = makeStyles((theme: Theme) => ({
  menuItem: {
    paddingTop: 8.5,
    paddingBottom: 8.5,
  },
  itemName: {
    maxWidth: '100%',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    height: 19,
  },
  comingSoonChip: {
    marginLeft: theme.spacing(1),
    height: 18,
  },
  comingSoonChipText: {
    fontSize: 8,
  },
}));

export const OptionsList = <T extends EnhancedSelectOption>(
  options: T[],
): React.JSX.Element[] => {
  const classes = OptionsListStyles();
  return options
    .map(({ id, name, label, disabled }, index) =>
      name ? (
        <MenuItem
          disabled={disabled}
          key={id}
          value={index}
          className={classes.menuItem}
        >
          <Typography
            title={label || name}
            className={classes.itemName}
            color="textSecondary"
          >
            {label || name}
          </Typography>
          {disabled && (
            <Chip
              className={classes.comingSoonChip}
              label={
                <Typography
                  className={classes.comingSoonChipText}
                  variant="subtitle2"
                >
                  COMING SOON
                </Typography>
              }
            />
          )}
        </MenuItem>
      ) : null,
    )
    .filter((x): x is React.JSX.Element => x !== null);
};

export const selectProps: TextFieldProps['SelectProps'] = {
  MenuProps: {
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'center',
    },
  },
};
