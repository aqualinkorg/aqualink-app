import React from 'react';
import { Button, Box, Container, Grid, Typography } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const BackButton = ({ siteId, bgColor, classes }: BackButtonProps) => {
  return (
    <Box bgcolor={bgColor}>
      <Container>
        <Grid container className={classes.backButtonWrapper}>
          <Button
            color="primary"
            startIcon={<ArrowBack />}
            component={Link}
            to={`/sites/${siteId}`}
          >
            <Typography className={classes.backButtonText}>
              Back to Site
            </Typography>
          </Button>
        </Grid>
      </Container>
    </Box>
  );
};

const styles = () =>
  createStyles({
    backButtonWrapper: {
      margin: '48px 0 16px 0',
    },

    backButtonText: {
      textTransform: 'none',
    },
  });

interface BackButtonIncomingProps {
  siteId: string;
  bgColor: string;
}

type BackButtonProps = BackButtonIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(BackButton);
