import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Link as ExternalLink,
  ButtonGroup,
  createStyles,
  Drawer,
  IconButton,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import { Clear, GitHub } from "@material-ui/icons";
import ovioLogo from "../../assets/img/ovio_logo.png";
import {
  GaAction,
  GaCategory,
  trackButtonClick,
} from "../../utils/google-analytics";

const darkBlue = "#095877";

const menuRoutes = [
  {
    text: "HOME",
    to: "/",
    gaActionLabel: "Home",
  },
  {
    text: "MAP",
    to: "/map",
    gaActionLabel: "Map",
  },
  {
    text: "BUOY",
    to: "/buoy",
    gaActionLabel: "Buoy",
  },
  {
    text: "DRONE",
    to: "/drones",
    gaActionLabel: "Drone",
  },
  {
    text: "ABOUT",
    to: "/about",
    gaActionLabel: "About",
  },
  {
    text: "STORIES",
    href: "https://stories.aqualink.org",
    gaActionLabel: "Stories",
  },
  {
    text: "FAQ",
    to: "/faq",
    gaActionLabel: "Faq",
  },
  {
    text: "TRACK A HEATWAVE",
    to: "/tracker",
    gaActionLabel: "Track a heatwave",
  },
  {
    text: "REGISTER A SITE",
    to: "/register",
    gaActionLabel: "Register a site",
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
          alignSelf: "flex-end",
          marginRight: 5,
          marginTop: 5,
          color: "white",
        }}
      >
        <Clear />
      </IconButton>
      {menuRoutes.map(({ text, to, href, gaActionLabel }) => (
        <Button
          className={classes.menuDrawerButton}
          key={text}
          component={href ? ExternalLink : Link}
          target={href ? "_blank" : undefined}
          href={href || undefined}
          to={to || ""}
          onClick={() =>
            trackButtonClick(
              GaCategory.BUTTON_CLICK,
              GaAction.SIDE_MENU_BUTTON_CLICK,
              gaActionLabel
            )
          }
        >
          <Typography variant="h6">{text}</Typography>
        </Button>
      ))}
      <Box marginTop="auto" padding="25px">
        <Typography variant="subtitle1">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          Aqualink's source code is licenced under MIT. Contribute!
        </Typography>
        <ButtonGroup variant="contained" color="default">
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
            <img src={ovioLogo} alt="Ovio Logo" />
          </Button>
        </ButtonGroup>
      </Box>
    </Drawer>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    paper: {
      width: "16rem",
      alignItems: "center",
      backgroundColor: darkBlue,
    },
    contributeButton: {
      width: "50%",
      textTransform: "none",
      "& img": {
        maxWidth: "100%",
      },
      "&:hover": {
        color: "black",
      },
    },
    menuDrawerButton: {
      margin: theme.spacing(2, 2, 2),
      "&:hover": {
        color: "white",
      },
    },
  });

interface MenuDrawerIncomingProps {
  open: boolean;
  onClose: any;
}

type MenuDrawerProps = MenuDrawerIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(MenuDrawer);
