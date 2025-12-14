import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { grey } from '@mui/material/colors';

function AddButton({ siteId, classes }: AddButtonProps) {
  return (
    <Button
      className={classes.addSurveyButton}
      startIcon={<AddCircleOutlineIcon />}
      component={Link}
      to={`/sites/${siteId}/new_survey`}
      classes={{ iconSizeMedium: classes.addSurveyButtonIcon }}
    >
      <Typography color="inherit" variant="h6">
        ADD NEW SURVEY
      </Typography>
    </Button>
  );
}

const styles = () =>
  createStyles({
    addSurveyButton: {
      color: grey[500],
      '&:hover': {
        color: grey[500],
      },
    },
    addSurveyButtonIcon: {
      '& > *:first-child': {
        fontSize: 32,
      },
    },
  });

interface AddButtonIncomingProps {
  siteId: number;
}

type AddButtonProps = AddButtonIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(AddButton);
