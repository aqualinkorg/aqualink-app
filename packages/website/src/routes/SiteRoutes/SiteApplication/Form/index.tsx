import React, { useCallback, useState, useEffect } from 'react';
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Typography,
  TextField,
  Button,
} from '@material-ui/core';
import { useForm, Controller } from 'react-hook-form';
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';
import {
  SiteApplication,
  SiteApplyParams,
} from '../../../../store/Sites/types';

interface SiteApplicationFormFields {
  siteName: string;
  permitRequirements: string;
  fundingSource: string;
  installationResources: string;
  installationSchedule: string;
}

const Form = ({
  siteName,
  application,
  agreed,
  handleFormSubmit,
  classes,
}: FormProps) => {
  const [installationSchedule, setInstallationSchedule] = useState<Date | null>(
    null,
  );

  useEffect(() => {
    if (application?.installationSchedule) {
      setInstallationSchedule(new Date(application.installationSchedule));
    }
  }, [application]);

  const {
    formState: { errors },
    handleSubmit,
    control,
  } = useForm<SiteApplicationFormFields>({
    reValidateMode: 'onSubmit',
  });

  const handleInstallationChange = (date: Date | null) => {
    if (date) {
      setInstallationSchedule(date);
    }
  };

  const formSubmit = useCallback(
    (data: SiteApplicationFormFields) => {
      const params: SiteApplyParams = {
        fundingSource: data.fundingSource,
        permitRequirements: data.permitRequirements,
        installationResources: data.installationResources,
        installationSchedule: new Date(data.installationSchedule).toISOString(),
      };
      handleFormSubmit(data.siteName, params);
    },
    [handleFormSubmit],
  );

  return (
    <form className={classes.form} onSubmit={handleSubmit(formSubmit)}>
      <Typography className={classes.formTitle} variant="h3">
        Your Site
      </Typography>
      <Controller
        name="siteName"
        control={control}
        rules={{
          required: 'This is a required field',
        }}
        render={({ field }) => (
          <TextField
            {...field}
            className={`${classes.formField} ${classes.textField}`}
            variant="outlined"
            inputProps={{ className: classes.textField }}
            fullWidth
            placeholder="Site Name e.g. 'Sombrero Site'"
            disabled
            defaultValue={siteName}
            error={!!errors.siteName}
            helperText={errors?.siteName?.message || ''}
          />
        )}
      />

      <Typography className={classes.additionalInfo}>
        Please provide some additional information for each site:
      </Typography>

      <Typography>Permitting</Typography>
      <Controller
        name="permitRequirements"
        control={control}
        rules={{
          required: 'This is a required field',
        }}
        render={({ field }) => (
          <TextField
            {...field}
            className={`${classes.formField} ${classes.textField}`}
            variant="outlined"
            inputProps={{ className: classes.textField }}
            fullWidth
            multiline
            rows={2}
            defaultValue={application?.permitRequirements || null}
            placeholder="Please describe the permitting requirements. Please be sure to mention the authority having jurisdiction."
            error={!!errors.permitRequirements}
            helperText={errors?.permitRequirements?.message || ''}
          />
        )}
      />

      <Typography>Funding Source</Typography>
      <Controller
        name="fundingSource"
        control={control}
        rules={{
          required: 'This is a required field',
        }}
        render={({ field }) => (
          <TextField
            {...field}
            className={`${classes.formField} ${classes.textField}`}
            variant="outlined"
            inputProps={{ className: classes.textField }}
            fullWidth
            multiline
            rows={2}
            defaultValue={application?.fundingSource || null}
            placeholder="Funding source for import duties and shipping. Please describe the funding source for the import duties and shipping costs."
            error={!!errors.fundingSource}
            helperText={errors?.fundingSource?.message || ''}
          />
        )}
      />

      <Typography>Schedule for installation</Typography>
      <Typography className={classes.scheduleDescription}>
        What is the soonest date you could install the Smart Buoy and conduct a
        survey?
      </Typography>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Controller
          name="installationSchedule"
          control={control}
          rules={{
            required: 'This is a required field',
            validate: {
              validDate: (value) =>
                moment(value, 'MM/DD/YYYY', true).isValid() || 'Invalid date',
            },
          }}
          render={({ field }) => (
            <KeyboardDatePicker
              className={classes.formField}
              disableToolbar
              format="MM/dd/yyyy"
              id="installationSchedule"
              autoOk
              showTodayButton
              helperText={errors?.installationSchedule?.message || ''}
              error={!!errors.installationSchedule}
              value={installationSchedule}
              ref={field.ref}
              onChange={(e) => {
                field.onChange(e);
                handleInstallationChange(e);
              }}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
              inputProps={{
                className: classes.textField,
              }}
              inputVariant="outlined"
            />
          )}
        />
      </MuiPickersUtilsProvider>

      <Typography>
        Installation, survey and maintenance personnel and equipment
      </Typography>
      <Controller
        name="installationResources"
        control={control}
        rules={{
          required: 'This is a required field',
        }}
        render={({ field }) => (
          <TextField
            {...field}
            className={`${classes.formField} ${classes.textField}`}
            variant="outlined"
            inputProps={{ className: classes.textField }}
            fullWidth
            multiline
            rows={4}
            defaultValue={application?.installationResources || null}
            placeholder="Please provide a description of the people that will be able to conduct periodic surveys and maintenance of the buoy. Please also include a description of the equipment (e.g. a boat, cameras) that are available."
            error={!!errors.installationResources}
            helperText={errors?.installationResources?.message || ''}
          />
        )}
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
      marginBottom: '3rem',
    },
    formTitle: {
      marginBottom: '2rem',
    },
    formField: {
      marginBottom: '3rem',
    },
    additionalInfo: {
      marginBottom: '3rem',
    },
    scheduleDescription: {
      fontWeight: 300,
      marginBottom: '0.5rem',
    },
    textField: {
      color: 'black',
      '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0, 0, 0, 0.23)',
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
  });

interface FormIncomingProps {
  siteName: string;
  application?: SiteApplication | null;
  agreed: boolean;
  handleFormSubmit: (siteName: string, params: SiteApplyParams) => void;
}

Form.defaultProps = {
  application: null,
};

type FormProps = FormIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Form);
