import React, { useCallback } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Button,
  Grid,
  TextField,
  Theme,
} from "@material-ui/core";
import { useForm } from "react-hook-form";

import { Reef, ReefUpdateParams } from "../../../../../store/Reefs/types";
import { getReefNameAndRegion } from "../../../../../store/Reefs/helpers";

const EditForm = ({ reef, onClose, onSubmit, classes }: EditFormProps) => {
  const reefName = getReefNameAndRegion(reef).name || "";
  const location = reef.polygon.type === "Point" ? reef.polygon : null;

  const { register, errors, handleSubmit } = useForm({
    reValidateMode: "onSubmit",
  });

  const formSubmit = useCallback(
    (data: any) => {
      const updateParams: ReefUpdateParams = {
        coordinates: {
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
        },
        name: data.siteName,
        depth: parseInt(data.depth, 10),
      };
      onSubmit(updateParams);
    },
    [onSubmit]
  );

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Grid container alignItems="flex-end" spacing={3}>
        <Grid container item sm={12} md={6} spacing={3}>
          <Grid item sm={8} xs={12}>
            <TextField
              className={classes.textField}
              variant="outlined"
              inputProps={{ className: classes.textField }}
              fullWidth
              defaultValue={reefName}
              label="Site Name"
              placeholder="Site Name"
              name="siteName"
              inputRef={register({
                required: "Required",
              })}
              error={!!errors.siteName}
              helperText={errors?.siteName?.message || ""}
            />
          </Grid>
          <Grid item sm={4} xs={12}>
            <TextField
              className={classes.textField}
              variant="outlined"
              inputProps={{ className: classes.textField }}
              fullWidth
              defaultValue={reef.depth}
              label="Depth"
              placeholder="Depth (m)"
              name="depth"
              inputRef={register({
                required: "Required",
                pattern: {
                  value: /^\d+$/,
                  message: "Invalid input",
                },
              })}
              error={!!errors.depth}
              helperText={errors?.depth?.message || ""}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <TextField
              className={classes.textField}
              variant="outlined"
              inputProps={{ className: classes.textField }}
              fullWidth
              defaultValue={location ? location.coordinates[1] : null}
              label="Latitude"
              placeholder="Latitude"
              name="latitude"
              inputRef={register({
                required: "Required",
                pattern: {
                  value: /^[+-]?([0-9]*[.])?[0-9]+$/,
                  message: "Invalid input",
                },
              })}
              error={!!errors.latitude}
              helperText={errors?.latitude?.message || ""}
            />
          </Grid>
          <Grid item sm={6} xs={12}>
            <TextField
              className={classes.textField}
              variant="outlined"
              inputProps={{ className: classes.textField }}
              fullWidth
              defaultValue={location ? location.coordinates[0] : null}
              label="Longitude"
              placeholder="Longitude"
              name="longitude"
              inputRef={register({
                required: "Required",
                pattern: {
                  value: /^[+-]?([0-9]*[.])?[0-9]+$/,
                  message: "Invalid input",
                },
              })}
              error={!!errors.longitude}
              helperText={errors?.longitude?.message || ""}
            />
          </Grid>
        </Grid>
        <Grid container justify="flex-end" item sm={12} md={4} spacing={3}>
          <Grid item>
            <Button
              className={classes.button}
              onClick={onClose}
              variant="outlined"
              size="small"
              color="secondary"
            >
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button
              className={classes.button}
              type="submit"
              variant="outlined"
              size="small"
              color="primary"
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    textField: {
      color: "black",
      height: "2.5rem",
      alignItems: "center",
      "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.23)",
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
    },
    button: {
      height: "2.5rem",
    },
  });

interface EditFormIncomingProps {
  reef: Reef;
  onClose: () => void;
  onSubmit: (data: ReefUpdateParams) => void;
}

type EditFormProps = EditFormIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(EditForm);
