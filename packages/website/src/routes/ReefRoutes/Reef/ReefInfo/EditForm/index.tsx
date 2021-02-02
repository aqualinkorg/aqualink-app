import React, { useEffect, ChangeEvent, FormEvent, useState } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Button,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useDispatch, useSelector } from "react-redux";
import isInt from "validator/lib/isInt";
import isNumeric from "validator/lib/isNumeric";

import { Reef, ReefUpdateParams } from "../../../../../store/Reefs/types";
import { getReefNameAndRegion } from "../../../../../store/Reefs/helpers";
import {
  reefDraftSelector,
  setReefDraft,
} from "../../../../../store/Reefs/selectedReefSlice";

const STEP = 1 / 10 ** 15;

interface FormField {
  value: string;
  error?: string;
}

const EditForm = ({
  reef,
  loading,
  onClose,
  onSubmit,
  classes,
}: EditFormProps) => {
  const dispatch = useDispatch();
  const draftReef = useSelector(reefDraftSelector);
  const location = reef.polygon.type === "Point" ? reef.polygon : null;
  const { latitude: draftLatitude, longitude: draftLongitude } =
    draftReef?.coordinates || {};

  // Form Fields
  const [reefName, setReefName] = useState<FormField>({
    value: getReefNameAndRegion(reef).name || "",
  });
  const [reefDepth, setReefDepth] = useState<FormField>({
    value: reef.depth?.toString() || "",
  });
  const [reefLatitude, setReefLatitude] = useState<FormField>({
    value: location ? location.coordinates[1].toString() : "",
  });
  const [reefLongitude, setReefLongitude] = useState<FormField>({
    value: location ? location.coordinates[0].toString() : "",
  });

  useEffect(() => {
    if (draftLatitude && draftLongitude) {
      setReefLatitude({ value: draftLatitude.toString() });
      setReefLongitude({ value: draftLongitude.toString() });
    }
  }, [draftLatitude, draftLongitude]);

  const formSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (
      reefName.value &&
      reefDepth.value &&
      reefLatitude.value &&
      reefLongitude.value
    ) {
      const updateParams: ReefUpdateParams = {
        coordinates: {
          latitude: parseFloat(reefLatitude.value),
          longitude: parseFloat(reefLongitude.value),
        },
        name: reefName.value,
        depth: parseInt(reefDepth.value, 10),
      };
      onSubmit(updateParams);
    }
    event.preventDefault();
  };

  const onFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name: field, value: newValue } = event.target;
    switch (field) {
      case "siteName":
        if (newValue === "") {
          setReefName({ value: newValue, error: "Required" });
          return;
        }
        if (newValue.length > 50) {
          setReefName({
            value: newValue,
            error: "Must not exceed 50 characters",
          });
          return;
        }
        setReefName({ value: newValue, error: undefined });
        break;
      case "depth":
        if (newValue === "") {
          setReefDepth({ value: newValue, error: "Required" });
          return;
        }
        if (!isInt(newValue)) {
          setReefDepth({ value: newValue, error: "Invalid" });
          return;
        }
        setReefDepth({ value: newValue, error: undefined });
        break;
      case "latitude":
        if (newValue === "") {
          setReefLatitude({ value: newValue, error: "Required" });
          return;
        }
        if (!isNumeric(newValue)) {
          setReefLatitude({ value: newValue, error: "Invalid" });
          return;
        }
        setReefLatitude({ value: newValue, error: undefined });
        dispatch(
          setReefDraft({
            ...draftReef,
            coordinates: draftReef?.coordinates && {
              ...draftReef.coordinates,
              latitude: parseFloat(newValue),
            },
          })
        );
        break;
      case "longitude":
        if (newValue === "") {
          setReefLongitude({ value: newValue, error: "Required" });
          return;
        }
        if (!isNumeric(newValue)) {
          setReefLongitude({ value: newValue, error: "Invalid" });
          return;
        }
        setReefLongitude({ value: newValue, error: undefined });
        dispatch(
          setReefDraft({
            ...draftReef,
            coordinates: draftReef?.coordinates && {
              ...draftReef.coordinates,
              longitude: parseFloat(newValue),
            },
          })
        );
        break;
      default:
        break;
    }
  };

  return (
    <form onSubmit={(e) => formSubmit(e)}>
      <Grid container alignItems="flex-end" spacing={3}>
        <Grid container item sm={12} md={6} spacing={2}>
          <Grid item sm={8} xs={12}>
            <TextField
              className={classes.textField}
              variant="outlined"
              inputProps={{ className: classes.textField }}
              fullWidth
              value={reefName.value}
              onChange={onFieldChange}
              label="Site Name"
              placeholder="Site Name"
              name="siteName"
              error={Boolean(reefName.error)}
              helperText={reefName.error}
            />
          </Grid>
          <Grid item sm={4} xs={12}>
            <TextField
              className={classes.textField}
              variant="outlined"
              inputProps={{ className: classes.textField, step: 1 }}
              fullWidth
              value={reefDepth.value}
              onChange={onFieldChange}
              label="Depth"
              placeholder="Depth (m)"
              name="depth"
              type="number"
              error={Boolean(reefDepth.error)}
              helperText={reefDepth.error}
            />
          </Grid>
          <Grid item xs={12}>
            <Alert className={classes.infoAlert} icon={false} severity="info">
              <Typography variant="subtitle2">
                You can also change your site position by dragging the pin on
                the map.
              </Typography>
            </Alert>
          </Grid>
          <Grid item sm={6} xs={12}>
            <TextField
              className={classes.textField}
              variant="outlined"
              type="number"
              inputProps={{
                className: classes.textField,
                step: STEP,
              }}
              fullWidth
              value={reefLatitude.value}
              onChange={onFieldChange}
              label="Latitude"
              placeholder="Latitude"
              name="latitude"
              error={Boolean(reefLatitude.error)}
              helperText={reefLatitude.error}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <TextField
              className={classes.textField}
              variant="outlined"
              type="number"
              inputProps={{
                className: classes.textField,
                step: STEP,
              }}
              fullWidth
              value={reefLongitude.value}
              onChange={onFieldChange}
              label="Longitude"
              placeholder="Longitude"
              name="longitude"
              error={Boolean(reefLongitude.error)}
              helperText={reefLongitude.error}
            />
          </Grid>
        </Grid>
        <Grid container justify="flex-end" item sm={12} md={4} spacing={3}>
          <Grid item>
            <Button
              onClick={onClose}
              variant="outlined"
              size="medium"
              color="secondary"
            >
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button
              type="submit"
              disabled={
                loading ||
                !!reefName.error ||
                !!reefDepth.error ||
                !!reefLongitude.error ||
                !!reefLatitude.error
              }
              variant="outlined"
              size="medium"
              color="primary"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
};

const styles = () =>
  createStyles({
    textField: {
      color: "black",
      alignItems: "center",
    },
    infoAlert: {
      marginTop: "0.5rem",
    },
  });

interface EditFormIncomingProps {
  reef: Reef;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: ReefUpdateParams) => void;
}

type EditFormProps = EditFormIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(EditForm);
