import React, { useCallback, useState, useEffect } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Typography,
  TextField,
  Button,
} from "@material-ui/core";
import { useForm } from "react-hook-form";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import moment from "moment";
import { ReefApplication, ReefApplyParams } from "../../../store/Reefs/types";

const Form = ({
  reefName,
  application,
  agreed,
  handleFormSubmit,
  classes,
}: FormProps) => {
  const [installationSchedule, setInstallationSchedule] = useState<Date | null>(
    null
  );

  useEffect(() => {
    if (application && application.installationSchedule) {
      setInstallationSchedule(new Date(application.installationSchedule));
    }
  }, [application]);

  const { register, errors, handleSubmit } = useForm({
    reValidateMode: "onSubmit",
  });

  const handleInstalationChange = (date: Date | null) => {
    if (date) {
      setInstallationSchedule(date);
    }
  };

  const formSubmit = useCallback(
    (data: any) => {
      const params: ReefApplyParams = {
        fundingSource: data.fundingSource,
        permitRequirements: data.permitRequirements,
        installationResources: data.installationResources,
        installationSchedule: new Date(data.installationSchedule).toISOString(),
      };
      handleFormSubmit(data.siteName, params);
    },
    [handleFormSubmit]
  );

  return (
    <form className={classes.form} onSubmit={handleSubmit(formSubmit)}>
      <Typography className={classes.formTitle} variant="h3">
        Your Site
      </Typography>

      <TextField
        className={`${classes.formField} ${classes.textField}`}
        variant="outlined"
        inputProps={{ className: classes.textField }}
        fullWidth
        placeholder="Reef Name e.g. 'Sombrero Reef'"
        disabled={Boolean(reefName)}
        defaultValue={reefName || null}
        name="siteName"
        inputRef={register({
          required: "This is a required field",
        })}
        error={!!errors.siteName}
        helperText={errors?.siteName?.message || ""}
      />

      <Typography className={classes.additionalInfo}>
        Please provide some additional information for each reef:
      </Typography>

      <Typography>Permitting</Typography>
      <TextField
        className={`${classes.formField} ${classes.textField}`}
        variant="outlined"
        inputProps={{ className: classes.textField }}
        fullWidth
        multiline
        rows={2}
        defaultValue={application?.permitRequirements || null}
        placeholder="Please describe the permitting requirements. Please be sure to mention the authority having jurisdiction"
        name="permitRequirements"
        inputRef={register({
          required: "This is a required field",
        })}
        error={!!errors.permitRequirements}
        helperText={errors?.permitRequirements?.message || ""}
      />

      <Typography>Funding Source</Typography>
      <TextField
        className={`${classes.formField} ${classes.textField}`}
        variant="outlined"
        inputProps={{ className: classes.textField }}
        fullWidth
        multiline
        rows={2}
        defaultValue={application?.fundingSource || null}
        placeholder="Funding source for import duties and shipping. Please describe the funding source for the import duties and shipping costs"
        name="fundingSource"
        inputRef={register({
          required: "This is a required field",
        })}
        error={!!errors.fundingSource}
        helperText={errors?.fundingSource?.message || ""}
      />

      <Typography>Schedule for installation</Typography>
      <Typography className={classes.scheduleDescription}>
        What is the soonest date you could install the spotter and conduct a
        survey?
      </Typography>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          className={classes.formField}
          disableToolbar
          format="MM/dd/yyyy"
          id="installationSchedule"
          name="installationSchedule"
          autoOk
          showTodayButton
          helperText={errors?.installationSchedule?.message || ""}
          inputRef={register({
            required: "This is a required field",
            validate: {
              validDate: (value) =>
                moment(value, "MM/DD/YYYY", true).isValid() || "Invalid date",
            },
          })}
          error={!!errors.installationSchedule}
          value={installationSchedule}
          onChange={handleInstalationChange}
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
          inputProps={{
            className: classes.textField,
          }}
          inputVariant="outlined"
        />
      </MuiPickersUtilsProvider>

      <Typography>
        Installation, survey and maintenance personnel and equipment
      </Typography>
      <TextField
        className={`${classes.formField} ${classes.textField}`}
        variant="outlined"
        inputProps={{ className: classes.textField }}
        fullWidth
        multiline
        rows={4}
        defaultValue={application?.installationResources || null}
        placeholder="Please provide a description of the people that will be able to conduct periodic surveys and maintenance of the buoy. Please also include a description of the equipment (e.g. a boat, cameras) that are available."
        name="installationResources"
        inputRef={register({
          required: "This is a required field",
        })}
        error={!!errors.installationResources}
        helperText={errors?.installationResources?.message || ""}
      />

      <Button
        disabled={!agreed}
        type="submit"
        color="primary"
        variant="contained"
      >
        Submit
      </Button>
    </form>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    form: {
      marginBottom: "3rem",
    },
    formTitle: {
      marginBottom: "2rem",
    },
    formField: {
      marginBottom: "3rem",
    },
    additionalInfo: {
      marginBottom: "3rem",
    },
    scheduleDescription: {
      fontWeight: 300,
      marginBottom: "0.5rem",
    },
    textField: {
      color: "black",
      "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.23)",
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
    },
  });

interface FormIncomingProps {
  reefName?: string | null;
  application?: ReefApplication | null;
  agreed: boolean;
  handleFormSubmit: (siteName: string, params: ReefApplyParams) => void;
}

Form.defaultProps = {
  reefName: null,
  application: null,
};

type FormProps = FormIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Form);
