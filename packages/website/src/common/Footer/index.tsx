import { AppBar, Toolbar, Grid, Typography, Theme, Link } from '@mui/material';

import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';

const Footer = ({ classes }: FooterProps) => {
  return (
    <AppBar className={classes.appBar} position="static">
      <Toolbar>
        <Grid container justifyContent="center">
          <Grid item xs={10} container>
            <Link className={classes.navBarLink} href="/map" underline="hover">
              <Typography color="textPrimary" variant="h4">
                Aqua
              </Typography>
              <Typography style={{ color: '#8AC6DE' }} variant="h4">
                link
              </Typography>
            </Link>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    appBar: {
      '&.MuiPaper-root': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
    },
    navBarLink: {
      display: 'flex',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'none',
      },
    },
  });

type FooterProps = WithStyles<typeof styles>;

export default withStyles(styles)(Footer);
