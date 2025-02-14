import {
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { AgreementsChecked } from '../types';

const agreements: { id: keyof AgreementsChecked; label: string }[] = [
  { id: 'shipping', label: 'Handle any shipping and permitting charges' },
  { id: 'buoy', label: 'Provide mooring and deploy buoy' },
  { id: 'survey', label: 'Conduct initial survey' },
];

const Agreements = ({
  agreementsChecked,
  handleChange,
  classes,
}: AgreementsProps) => {
  return (
    <div className={classes.agreements}>
      <Typography variant="h5">Agree to:</Typography>
      <FormGroup>
        {agreements.map(({ id, label }) => (
          <FormControlLabel
            key={label}
            className={classes.formControlLabel}
            control={
              <Checkbox
                color="primary"
                checked={agreementsChecked[id]}
                onChange={() => handleChange(id)}
              />
            }
            label={label}
          />
        ))}
      </FormGroup>
    </div>
  );
};

const styles = () =>
  createStyles({
    agreements: {
      marginTop: '3rem',
      padding: '1rem',
    },
    formControlLabel: {
      marginBottom: 0,
    },
  });

interface AgreementsIncomingProps {
  agreementsChecked: AgreementsChecked;
  handleChange: (id: keyof AgreementsChecked) => void;
}

type AgreementsProps = AgreementsIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Agreements);
