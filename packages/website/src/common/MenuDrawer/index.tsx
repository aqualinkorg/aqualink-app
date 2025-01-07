import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Link as ExternalLink,
  ButtonGroup,
  Drawer,
  IconButton,
  Theme,
  Typography,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import { Clear, GitHub } from '@mui/icons-material';
import { GaAction, GaCategory, trackButtonClick } from 'utils/google-analytics';
import ovioLogo from '../../assets/img/ovio_logo.png';

const darkBlue = '#095877';

const menuRoutes = [
  {
    text: 'Home',
    to: '/',
  },
  {
    text: 'Map',
    to: '/map',
  },
  {
    text: 'Register a site',
    to: '/register',
  },

  {
    text: 'Highlighted Sites',
    href: 'https://highlights.aqualink.org',
  },
  {
    text: 'Bristlemouth Explorer',
    href: 'https://bristlemouth.aqualink.org',
  },
  {
    text: 'Track a heatwave',
    to: '/tracker',
  },
  {
    text: 'About',
    to: '/about',
  },
  {
    text: 'Faq',
    to: '/faq',
  },
  {
    text: 'Buoy',
    to: '/buoy',
  },
  {
    text: 'Drone',
    to: '/drones',
  },
];

const MenuDrawer = ({ classes, open, onClose }: MenuDrawerProps) => {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      classes={{ paper: classes.paper }}
    >
      <IconButton
        onClick={onClose}
        style={{
          alignSelf: 'flex-end',
          marginRight: 5,
          marginTop: 5,
          color: 'white',
        }}
        size="large"
      >
        <Clear />
      </IconButton>
      {menuRoutes.map(({ text, to, href }) => (
        <Button
          className={classes.menuDrawerButton}
          color="inherit"
          key={text}
          component={href ? ExternalLink : Link}
          target={href ? '_blank' : undefined}
          href={href || undefined}
          to={to || ''}
          onClick={() =>
            trackButtonClick(
              GaCategory.BUTTON_CLICK,
              GaAction.SIDE_MENU_BUTTON_CLICK,
              text,
            )
          }
        >
          <Typography variant="h6" style={{ textTransform: 'uppercase' }}>
            {text}
          </Typography>
        </Button>
      ))}
      <Box marginTop="auto" padding="25px">
        <Typography variant="subtitle1">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          Aqualink is open-source (MIT)
          <br />
          Join us and contribute!
        </Typography>
        <ButtonGroup variant="contained">
          <Button
            target="_blank"
            href="https://github.com/aqualinkorg/aqualink-app"
            startIcon={<GitHub />}
            className={classes.contributeButton}
          >
            GitHub
          </Button>

          <Button
            target="_blank"
            href="https://ovio.org/project/aqualinkorg/aqualink-app"
            className={classes.contributeButton}
          >
            <img src={ovioLogo.src} alt="Ovio Logo" />
          </Button>
        </ButtonGroup>
      </Box>
    </Drawer>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      width: '18rem',
      alignItems: 'center',
      backgroundColor: darkBlue,
    },
    contributeButton: {
      width: '50%',
      textTransform: 'none',
      '& img': {
        maxWidth: '100%',
      },
      '&:hover': {
        color: 'black',
      },
    },
    menuDrawerButton: {
      margin: theme.spacing(2, 2, 2),
      '&:hover': {
        color: 'white',
      },
    },
  });

interface MenuDrawerIncomingProps {
  open: boolean;
  onClose: any;
}

type MenuDrawerProps = MenuDrawerIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(MenuDrawer);
