import React, { ChangeEvent } from 'react';
import { Button, Grid, Typography } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import Alert from '@mui/material/Alert';
import { find } from 'lodash';

import { FormField } from 'hooks/useFormField';
import TextField from 'common/Forms/TextField';

const NUMERIC_FIELD_STEP = 1 / 10 ** 15;

function EditForm({
  editLoading,
  editPointName,
  editPointLatitude,
  editPointLongitude,
  onFieldChange,
  onCancelButtonClick,
  onSaveButtonClick,
  classes,
}: EditFormProps) {
  return (
    <Grid
      className={classes.formWrapper}
      container
      item
      xs={12}
      md={6}
      spacing={2}
    >
      <Grid item xs={12} sm={6}>
        <TextField
          formField={editPointName}
          label="Point Name"
          placeholder="Point Name"
          name="pointName"
          onChange={onFieldChange}
        />
      </Grid>
      <Grid item>
        <Grid container justifyContent="space-between" spacing={2}>
          <Grid item xs={12}>
            <Alert className={classes.infoAlert} icon={false} severity="info">
              <Typography variant="subtitle2">
                You can also change the survey point&apos;s position by dragging
                the pin on the map.
              </Typography>
            </Alert>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              formField={editPointLatitude}
              label="Latitude"
              placeholder="Latitude"
              name="latitude"
              isNumeric
              step={NUMERIC_FIELD_STEP}
              onChange={onFieldChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              formField={editPointLongitude}
              label="Longitude"
              placeholder="Longitude"
              name="longitude"
              isNumeric
              step={NUMERIC_FIELD_STEP}
              onChange={onFieldChange}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container justifyContent="flex-end" spacing={2}>
          <Grid item>
            <Button
              onClick={onCancelButtonClick}
              variant="outlined"
              color="secondary"
              size="small"
            >
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button
              onClick={onSaveButtonClick}
              variant="outlined"
              color="primary"
              size="small"
              disabled={
                editLoading ||
                !!find(
                  [editPointName, editPointLatitude, editPointLongitude],
                  (field) => field.error,
                )
              }
            >
              {editLoading ? 'Saving...' : 'Save'}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

const styles = () =>
  createStyles({
    formWrapper: {
      padding: 24,
    },

    infoAlert: {
      marginTop: '0.5rem',
    },
  });

interface EditFormIncomingProps {
  editLoading: boolean;
  editPointName: FormField<string>;
  editPointLatitude: FormField<string>;
  editPointLongitude: FormField<string>;
  onCancelButtonClick: () => void;
  onSaveButtonClick: () => void;
  onFieldChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

type EditFormProps = EditFormIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(EditForm);
