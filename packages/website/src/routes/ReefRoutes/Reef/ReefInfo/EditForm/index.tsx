import React, { ChangeEvent, FormEvent } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Button,
  Grid,
  Typography,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useDispatch, useSelector } from "react-redux";
import { find } from "lodash";

import TextField from "../../../../../common/Forms/TextField";
import { Reef, ReefUpdateParams } from "../../../../../store/Reefs/types";
import { getReefNameAndRegion } from "../../../../../store/Reefs/helpers";
import {
  reefDraftSelector,
  setReefDraft,
} from "../../../../../store/Reefs/selectedReefSlice";
import { useFormField } from "../../../../../common/Forms/useFormField";

const NUMERIC_FIELD_STEP = 1 / 10 ** 15;

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

  const setDraftReefCoordinates = (field: "longitude" | "latitude") => (
    value: string
  ) => {
    dispatch(
      setReefDraft({
        ...draftReef,
        coordinates: draftReef?.coordinates && {
          ...draftReef.coordinates,
          [field]: parseFloat(value),
        },
      })
    );
  };

  // Form Fields
  const [reefName, setReefName] = useFormField(
    getReefNameAndRegion(reef).name,
    ["required", "maxLength"]
  );

  const [reefDepth, setReefDepth] = useFormField(reef.depth?.toString(), [
    "required",
    "isInt",
  ]);

  const [reefLatitude, setReefLatitude] = useFormField(
    location?.coordinates[1].toString(),
    ["required", "isNumeric", "isLat"],
    draftLatitude?.toString(),
    setDraftReefCoordinates("latitude")
  );

  const [reefLongitude, setReefLongitude] = useFormField(
    location?.coordinates[0].toString(),
    ["required", "isNumeric", "isLong"],
    draftLongitude?.toString(),
    setDraftReefCoordinates("longitude")
  );

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
        setReefName(newValue);
        break;
      case "depth":
        setReefDepth(newValue);
        break;
      case "latitude":
        setReefLatitude(newValue, true);
        break;
      case "longitude":
        setReefLongitude(newValue, true);
        break;
      default:
        break;
    }
  };

  return (
    <form onSubmit={formSubmit}>
      <Grid container alignItems="flex-end" spacing={3}>
        <Grid container item sm={12} md={6} spacing={2}>
          <Grid item sm={8} xs={12}>
            <TextField
              formField={reefName}
              label="Site Name"
              placeholder="Site Name"
              name="siteName"
              onChange={onFieldChange}
            />
          </Grid>
          <Grid item sm={4} xs={12}>
            <TextField
              formField={reefDepth}
              label="Depth"
              placeholder="Depth (m)"
              name="depth"
              isNumeric
              step={1}
              onChange={onFieldChange}
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
              formField={reefLatitude}
              label="Latitude"
              placeholder="Latitude"
              name="latitude"
              isNumeric
              step={NUMERIC_FIELD_STEP}
              onChange={onFieldChange}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <TextField
              formField={reefLongitude}
              label="Longitude"
              placeholder="Longitude"
              name="longitude"
              isNumeric
              step={NUMERIC_FIELD_STEP}
              onChange={onFieldChange}
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
                !!find(
                  [reefName, reefDepth, reefLongitude, reefLatitude],
                  (field) => field.error
                )
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
