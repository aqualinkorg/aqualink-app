import React from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Typography,
  withStyles,
  WithStyles,
  createStyles,
} from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { grey } from '@material-ui/core/colors';

const AddButton = ({ siteId, classes }: AddButtonProps) => {
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
};

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
