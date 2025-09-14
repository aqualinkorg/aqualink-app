import React, { ChangeEvent } from 'react';
import {
  Grid,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { useDispatch } from 'react-redux';

import { User } from 'store/User/types';
import { setName } from 'store/Collection/collectionSlice';
import { useFormField } from 'hooks/useFormField';
import TextField from 'common/Forms/TextField';
import collectionServices from 'services/collectionServices';

import { red, green } from '@mui/material/colors';

function EditNameForm({
  collectionId,
  initialName,
  signedInUser,
  onClose,
  classes,
}: EditNameFormProps) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [collectionName, setCollectionName] = useFormField(initialName, [
    'required',
    'maxLength',
  ]);

  const onChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setCollectionName(event.target.value);
  };

  const onSubmit = () => {
    if (signedInUser?.token && collectionId) {
      collectionServices
        .updateCollection(
          { id: collectionId, name: collectionName.value },
          signedInUser.token,
        )
        .then(() => dispatch(setName(collectionName.value)))
        .catch(console.error)
        .finally(() => onClose());
    }
  };

  return (
    <Grid item xs={12}>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={7}>
          <TextField
            formField={collectionName}
            label="Name"
            name="collectionName"
            placeholder="Collection Name"
            fullWidth
            size="small"
            onChange={onChange}
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <Grid
            container
            justifyContent={isMobile ? 'flex-end' : 'flex-start'}
            spacing={1}
          >
            <Grid item>
              <Tooltip title="Save" placement="top" arrow>
                <IconButton
                  disabled={!!collectionName.error}
                  onClick={onSubmit}
                  className={classes.checkButton}
                  size="large"
                >
                  <CheckIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <Tooltip title="Cancel" placement="top" arrow>
                <IconButton
                  onClick={onClose}
                  className={classes.clearIcon}
                  size="large"
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

const styles = () =>
  createStyles({
    checkButton: {
      color: green[500],
    },
    clearIcon: {
      color: red[500],
    },
  });

interface EditNameFormIncomingProps {
  collectionId?: number;
  initialName: string;
  signedInUser: User | null;
  onClose: () => void;
}

type EditNameFormProps = EditNameFormIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(EditNameForm);
