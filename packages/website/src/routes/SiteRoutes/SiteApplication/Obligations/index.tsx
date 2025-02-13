import { Typography } from '@mui/material';

import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

const obligations = [
  'Pay for shipping and any applicable duties',
  'Obtain any necessary permits (if applicable)',
  'Deploy the buoy with an appropriate mooring or anchor weight',
  'Maintain buoy (inspect and clean every 6 months)',
  'Conduct initial and periodic photographic surveys and upload imagery to our website',
];

const Obligations = ({ classes }: ObligationsProps) => {
  return (
    <div className={classes.obligations}>
      <Typography className={classes.obligationsTitle} variant="h3">
        Your Obligations
      </Typography>
      <Typography>
        You will be given a free smart buoy but there are some things you will
        will be expected to do or provide:
      </Typography>
      <div className={classes.obligationsList}>
        {obligations.map((item, index) => (
          <Typography key={item}>{`${index + 1}. ${item}`}</Typography>
        ))}
      </div>
    </div>
  );
};

const styles = () =>
  createStyles({
    obligations: {
      backgroundColor: '#F5F5F5',
      padding: '1.5rem',
    },
    obligationsTitle: {
      marginBottom: '2rem',
    },
    obligationsList: {
      marginTop: '1rem',
      padding: '0 1rem 0 1rem',
    },
  });

type ObligationsProps = WithStyles<typeof styles>;

export default withStyles(styles)(Obligations);
