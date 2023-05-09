import React, { ChangeEvent, FormEvent } from 'react';
import {
  withStyles,
  WithStyles,
  createStyles,
  Button,
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useDispatch, useSelector } from 'react-redux';
import { find } from 'lodash';

import TextField from '../../../../../common/Forms/TextField';
import { Site, SiteUpdateParams } from '../../../../../store/Sites/types';
import { getSiteNameAndRegion } from '../../../../../store/Sites/helpers';
import {
  siteDraftSelector,
  setSiteDraft,
} from '../../../../../store/Sites/selectedSiteSlice';
import { useFormField } from '../../../../../hooks/useFormField';

const NUMERIC_FIELD_STEP = 1 / 10 ** 15;

const EditForm = ({
  site,
  loading,
  onClose,
  onSubmit,
  classes,
}: EditFormProps) => {
  const dispatch = useDispatch();
  const draftSite = useSelector(siteDraftSelector);
  const location = site.polygon.type === 'Point' ? site.polygon : null;
  const { latitude: draftLatitude, longitude: draftLongitude } =
    draftSite?.coordinates || {};

  const [editToken, setEditToken] = React.useState(false);
  const [useDefaultToken, setUseDefaultToken] = React.useState(false);

  const setDraftSiteCoordinates =
    (field: 'longitude' | 'latitude') => (value: string) => {
      dispatch(
        setSiteDraft({
          ...draftSite,
          coordinates: draftSite?.coordinates && {
            ...draftSite.coordinates,
            [field]: parseFloat(value),
          },
        }),
      );
    };

  // Form Fields
  const [siteName, setSiteName] = useFormField(
    getSiteNameAndRegion(site).name,
    ['required', 'maxLength'],
  );

  const [siteDepth, setSiteDepth] = useFormField(site.depth?.toString(), [
    'required',
    'isInt',
  ]);

  const [siteLatitude, setSiteLatitude] = useFormField(
    location?.coordinates[1].toString(),
    ['required', 'isNumeric', 'isLat'],
    draftLatitude?.toString(),
    setDraftSiteCoordinates('latitude'),
  );

  const [siteLongitude, setSiteLongitude] = useFormField(
    location?.coordinates[0].toString(),
    ['required', 'isNumeric', 'isLong'],
    draftLongitude?.toString(),
    setDraftSiteCoordinates('longitude'),
  );

  const [siteSensorId, setSensorId] = useFormField(site.sensorId, [
    'maxLength',
  ]);

  const [siteSofarApiToken, setSiteSofarApiToken] = useFormField(null, [
    'maxLength',
  ]);

  const formSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (
      siteName.value &&
      siteDepth.value &&
      siteLatitude.value &&
      siteLongitude.value
    ) {
      const insertedTokenValue = siteSofarApiToken.value
        ? siteSofarApiToken.value
        : undefined;
      const tokenValue = useDefaultToken ? null : insertedTokenValue;
      const sofarApiToken = editToken ? tokenValue : undefined;
      const updateParams: SiteUpdateParams = {
        coordinates: {
          latitude: parseFloat(siteLatitude.value),
          longitude: parseFloat(siteLongitude.value),
        },
        name: siteName.value,
        depth: parseInt(siteDepth.value, 10),
        sensorId: siteSensorId.value,
        sofarApiToken,
      };
      onSubmit(updateParams);
    }
    event.preventDefault();
  };

  const onFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name: field, value: newValue } = event.target;
    switch (field) {
      case 'siteName':
        setSiteName(newValue);
        break;
      case 'depth':
        setSiteDepth(newValue);
        break;
      case 'latitude':
        setSiteLatitude(newValue, true);
        break;
      case 'longitude':
        setSiteLongitude(newValue, true);
        break;
      case 'spotterId':
        setSensorId(newValue);
        break;
      case 'sofarApiToken':
        setSiteSofarApiToken(newValue);
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
              formField={siteName}
              label="Site Name"
              placeholder="Site Name"
              name="siteName"
              onChange={onFieldChange}
            />
          </Grid>
          <Grid item sm={4} xs={12}>
            <TextField
              formField={siteDepth}
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
                Only Sofar Ocean spotters are supported for now. Please contact
                us if you would like to connect other live buoys at{' '}
                <a
                  href="mailto:admin@aqualink.org?subject=Questions%20or%20Comments"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  admin@aqualink.org
                </a>
                .
              </Typography>
            </Alert>
          </Grid>
          <Grid item sm={8} xs={8}>
            <TextField
              formField={siteSensorId}
              label="Spotter ID"
              placeholder="Spotter ID"
              name="spotterId"
              onChange={onFieldChange}
            />
          </Grid>
          <Grid
            item
            xs={4}
            style={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <FormControlLabel
              labelPlacement="start"
              control={
                <Checkbox
                  color="primary"
                  checked={editToken}
                  onChange={() => setEditToken(!editToken)}
                />
              }
              label="Update sofar token"
            />
          </Grid>
          {editToken && (
            <>
              <Grid item sm={8} xs={8}>
                <TextField
                  disabled={useDefaultToken}
                  formField={siteSofarApiToken}
                  label="Sofar API token"
                  placeholder="Sofar API token"
                  name="sofarApiToken"
                  onChange={onFieldChange}
                />
              </Grid>
              <Grid
                item
                xs={4}
                style={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <FormControlLabel
                  labelPlacement="start"
                  control={
                    <Checkbox
                      color="primary"
                      checked={useDefaultToken}
                      onChange={() => setUseDefaultToken(!useDefaultToken)}
                    />
                  }
                  label="Use default"
                />
              </Grid>
            </>
          )}
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
              formField={siteLatitude}
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
              formField={siteLongitude}
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
                  [siteName, siteDepth, siteLongitude, siteLatitude],
                  (field) => field.error,
                )
              }
              variant="outlined"
              size="medium"
              color="primary"
            >
              {loading ? 'Saving...' : 'Save'}
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
      color: 'black',
      alignItems: 'center',
    },
    infoAlert: {
      marginTop: '0.5rem',
    },
  });

interface EditFormIncomingProps {
  site: Site;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: SiteUpdateParams) => void;
}

type EditFormProps = EditFormIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(EditForm);
