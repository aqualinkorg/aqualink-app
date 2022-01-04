import React, { useState } from "react";
import {
  Grid,
  makeStyles,
  TextField,
  Theme,
  MenuItem,
  Typography,
  TextFieldProps,
  Button,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { Site } from "../../../store/Sites/types";

interface SelectOption {
  id: number;
  name: string | null;
  label?: string;
}

const SENSOR_TYPES: SelectOption[] = [
  { id: 1, name: "sonde", label: "Sonde data" },
];

const Selectors = ({ site, onCompletedSelection }: SelectorsProps) => {
  const classes = useStyles();
  const pointOptions = site.surveyPoints;
  const [selectedPointId, setSelectedPointId] = useState<number>();
  const [selectedSensorId, setSelectedSensorId] = useState<number>();
  const selectedPointIndex = pointOptions.findIndex(
    ({ id }) => id === selectedPointId
  );
  const hasSelectedPoint = selectedPointIndex !== -1;

  const selectedSensorIndex = SENSOR_TYPES.findIndex(
    ({ id }) => id === selectedSensorId
  );
  const hasSelectedSensor = selectedSensorIndex !== -1;

  const isContinueDisabled = !hasSelectedPoint || !hasSelectedSensor;

  const selectProps: TextFieldProps["SelectProps"] = {
    MenuProps: {
      PaperProps: { className: classes.menuPaper },
      anchorOrigin: {
        vertical: "bottom",
        horizontal: "center",
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "center",
      },
      getContentAnchorEl: null,
    },
  };

  const OptionsList = <T extends SelectOption>(options: T[]) =>
    options.map(({ id, name, label }) =>
      name ? (
        <MenuItem key={id} value={id} className={classes.menuItem}>
          <Typography
            title={label || name}
            className={classes.itemName}
            color="textSecondary"
          >
            {label || name}
          </Typography>
        </MenuItem>
      ) : null
    );

  const handleChange =
    (type: "point" | "sensor") =>
    (event: React.ChangeEvent<{ value: unknown }>) => {
      const value = event.target.value as number;

      switch (type) {
        case "point":
          setSelectedPointId(value);
          break;
        case "sensor":
          setSelectedSensorId(value);
          break;
        default:
          break;
      }
    };

  return (
    <>
      <Grid
        container
        className={classes.selectorsWrapper}
        spacing={3}
        justify="space-between"
      >
        <Grid item md={4} xs={12}>
          <TextField
            label="Site"
            fullWidth
            disabled
            variant="outlined"
            value={site.name}
          />
        </Grid>
        <Grid item md={4} xs={12}>
          <TextField
            label="Survey point"
            value={hasSelectedPoint ? pointOptions[selectedPointIndex].id : ""}
            onChange={handleChange("point")}
            variant="outlined"
            fullWidth
            select
            SelectProps={selectProps}
          >
            {OptionsList(pointOptions)}
          </TextField>
        </Grid>
        <Grid item md={4} xs={12}>
          <TextField
            label="Sensor type"
            value={
              hasSelectedSensor ? SENSOR_TYPES[selectedSensorIndex].id : ""
            }
            onChange={handleChange("sensor")}
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
    maxWidth: "100%",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    height: 19,
  },
  menuPaper: {
    width: 240,
  },
}));

interface SelectorsProps {
  site: Site;
  onCompletedSelection: () => void;
}

export default Selectors;
