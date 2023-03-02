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
    text: "Home",
    to: "/",
  },
  {
    text: "Map",
    to: "/map",
  },
  {
    text: "Buoy",
    to: "/buoy",
  },
  {
    text: "Drone",
    to: "/drones",
  },
  {
    text: "About",
    to: "/about",
  },
  {
    text: "Highlighted Sites",
    href: "https://highlights.aqualink.org",
  },
  {
    text: "Faq",
    to: "/faq",
  },
  {
    text: "Track a heatwave",
    to: "/tracker",
  },
  {
    text: "Register a site",
    to: "/register",
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
      {menuRoutes.map(({ text, to, href }) => (
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
              text
            )
          }
        >
          <Typography variant="h6">{text.toUpperCase()}</Typography>
        </Button>
      ))}
      <Box marginTop="auto" padding="25px">
        <Typography variant="subtitle1">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          Aqualink is open-source (MIT). Join us and contribute!
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
