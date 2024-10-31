import React, { useEffect, useState } from 'react';
import {
  Grid,
  TextField,
  Theme,
  MenuItem,
  Button,
  ButtonProps,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { Site, Sources } from 'store/Sites/types';
import { uploadsTargetSelector } from 'store/uploads/uploadsSlice';
import NewSurveyPointDialog from 'common/NewSurveyPointDialog';
import { OptionsList, selectProps, SENSOR_TYPES } from 'routes/Uploads/utils';

const Selectors = ({
  site,
  siteTimezone,
  setSiteTimezone,
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

  const handleChange =
    (type: 'point' | 'sensor' | 'timezone') =>
    (event: React.ChangeEvent<{ value: unknown; checked?: unknown }>) => {
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
        case 'timezone':
          setSiteTimezone(event.target.checked as boolean);
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
        <Grid item md={12} xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={siteTimezone}
                onChange={handleChange('timezone')}
                color="primary"
              />
            }
            label="Use Site Timezone"
          />
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
  menuPaper: {
    width: 240,
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
  siteTimezone: boolean;
  setSiteTimezone: (v: boolean) => void;
  onCompletedSelection: () => void;
  onSensorChange: (sensor: Sources) => void;
  onPointChange: (point: number) => void;
}

export default Selectors;
