import React, { useEffect, useState } from 'react';
import {
  Grid,
  makeStyles,
  TextField,
  Theme,
  MenuItem,
  Typography,
  TextFieldProps,
  Button,
  Chip,
  ButtonProps,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { Site, Sources } from 'store/Sites/types';
import { uploadsTargetSelector } from 'store/uploads/uploadsSlice';
import NewSurveyPointDialog from 'common/NewSurveyPointDialog';

interface SelectOption {
  id: number;
  name: string | null;
  label?: string;
}

type EnhancedSelectOption = SelectOption & { disabled?: boolean };

const SENSOR_TYPES: EnhancedSelectOption[] = [
  { id: 5, name: 'sheet_data', label: 'Default' },
  { id: 0, name: 'sonde', label: 'Sonde data' },
  { id: 1, name: 'metlog', label: 'Meteorological data' },
  { id: 3, name: 'hobo', label: 'HOBO data' },
  { id: 4, name: 'hui', label: 'HUI data' },
  { id: 2, name: 'spotter', label: 'Spotter data', disabled: true },
];

const Selectors = ({
  site,
  onCompletedSelection,
  onSensorChange,
  onPointChange,
}: SelectorsProps) => {
  const classes = useStyles();
  const uploadsTarget = useSelector(uploadsTargetSelector);
  const pointOptions = site.surveyPoints;
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>();
  const [selectedSensorIndex, setSelectedSensorIndex] = useState<number>();
  const [isNewPointDialogOpen, setIsNewPointDialogOpen] = useState(false);

  const pointSelectorValue =
    typeof selectedPointIndex === 'number' ? selectedPointIndex : '';
  const sensorSelectorValue =
    typeof selectedSensorIndex === 'number' ? selectedSensorIndex : '';

  const hasSelectedPoint = typeof selectedPointIndex === 'number';
  const hasSelectedSensor = typeof selectedSensorIndex === 'number';

  const isContinueDisabled = !hasSelectedPoint || !hasSelectedSensor;

  const selectProps: TextFieldProps['SelectProps'] = {
    MenuProps: {
      PaperProps: { className: classes.menuPaper },
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
      transformOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
      getContentAnchorEl: null,
    },
  };

  const OptionsList = <T extends EnhancedSelectOption>(options: T[]) =>
    options.map(({ id, name, label, disabled }, index) =>
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
    );

  const handleChange =
    (type: 'point' | 'sensor') =>
    (event: React.ChangeEvent<{ value: unknown }>) => {
      const value = event.target.value as number;

      switch (type) {
        case 'point':
          setSelectedPointIndex(value);
          onPointChange(pointOptions[value].id);
          break;
        case 'sensor':
          setSelectedSensorIndex(value);
          onSensorChange(SENSOR_TYPES[value].name as Sources);
          break;
        default:
          break;
      }
    };

  const handleNewPointDialogOpen: ButtonProps['onClick'] = (event) => {
    setIsNewPointDialogOpen(true);
    event.stopPropagation();
  };

  const handleNewPointDialogClose = () => setIsNewPointDialogOpen(false);

  useEffect(() => {
    if (uploadsTarget) {
      const newPointIndex = uploadsTarget.selectedPoint - 1;
      const newSensorIndex = SENSOR_TYPES.findIndex(
        (x) => x.name === uploadsTarget.selectedSensor,
      );
      setSelectedPointIndex(newPointIndex);
      setSelectedSensorIndex(newSensorIndex);
    } else {
      setSelectedPointIndex(undefined);
      setSelectedSensorIndex(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadsTarget]);

  return (
    <>
      <NewSurveyPointDialog
        open={isNewPointDialogOpen}
        siteId={site.id}
        onClose={handleNewPointDialogClose}
      />
      <Grid
        container
        className={classes.selectorsWrapper}
        spacing={3}
        justifyContent="space-between"
      >
        <Grid item md={4} xs={12}>
          <TextField
            label="Site"
            fullWidth
            disabled
            variant="outlined"
            value={site.name || `Site ${site.id}`}
          />
        </Grid>
        <Grid item md={4} xs={12}>
          <TextField
            label="Survey point"
            value={pointSelectorValue}
            onChange={handleChange('point')}
            variant="outlined"
            fullWidth
            select
            SelectProps={selectProps}
          >
            {OptionsList(pointOptions)}
            <MenuItem className={classes.buttonMenuItem}>
              <Button
                onClick={handleNewPointDialogOpen}
                className={classes.newPointButton}
                startIcon={<AddIcon />}
                color="primary"
                size="small"
                fullWidth
              >
                ADD NEW SURVEY POINT
              </Button>
            </MenuItem>
          </TextField>
        </Grid>
        <Grid item md={4} xs={12}>
          <TextField
            label="Sensor type"
            value={sensorSelectorValue}
            onChange={handleChange('sensor')}
            variant="outlined"
            fullWidth
            select
            SelectProps={selectProps}
          >
            {OptionsList(SENSOR_TYPES)}
          </TextField>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item>
          <Button
            component={Link}
            to={`/sites/${site.id}`}
            size="small"
            variant="outlined"
            color="primary"
          >
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            onClick={onCompletedSelection}
            disabled={isContinueDisabled}
            size="small"
            variant="outlined"
            color="primary"
          >
            Continue to Upload
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  selectorsWrapper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
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
  menuPaper: {
    width: 240,
  },
  comingSoonChip: {
    marginLeft: theme.spacing(1),
    height: 18,
  },
  comingSoonChipText: {
    fontSize: 8,
  },
  buttonMenuItem: {
    padding: 0,
  },
  newPointButton: {
    color: theme.palette.text.secondary,
    paddingTop: 8.5,
    paddingBottom: 8.5,
  },
}));

interface SelectorsProps {
  site: Site;
  onCompletedSelection: () => void;
  onSensorChange: (sensor: Sources) => void;
  onPointChange: (point: number) => void;
}

export default Selectors;
