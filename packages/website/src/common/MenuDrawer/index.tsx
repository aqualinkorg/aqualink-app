import React from "react";
import {
  Box,
  createStyles,
  Drawer,
  IconButton,
  Link,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import { Clear, GitHub } from "@material-ui/icons";

const menuRoutes = [
  {
    text: "HOME",
    href: "/",
  },
  {
    text: "BUOY",
    href: "/buoy",
  },
  {
    text: "DRONE",
    href: "/drones",
  },
  {
    text: "ABOUT",
    href: "/about",
  },
  {
    text: "FAQ",
    href: "/faq",
  },
  {
    text: "REGISTER A SITE",
    href: "/register",
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
      {menuRoutes.map(({ text, href }) => (
        <Link
          key={text}
          href={href}
          style={{
            margin: "1rem 2rem 2rem",
            fontSize: "1rem",
            color: "white",
          }}
        >
          {text}
        </Link>
      ))}
      <Box marginTop="auto" padding="25px">
        <Typography variant="subtitle1">
          Aqualink is licenced under MIT.
        </Typography>
        <Typography variant="subtitle1">Contribute!</Typography>
        <Box className={classes.buttonBox}>
          <a href="https://github.com/aqualinkorg/aqualink-app">
            <IconButton size="medium">
              <GitHub style={{ color: "white" }} />
            </IconButton>
          </a>
          <a href="https://ovio.org/project/aqualinkorg/aqualink-app">
            <IconButton size="medium">
              <img
                src="https://www.okta.com/sites/default/files/styles/400x400_scaled/public/media/image/2020-07/ovio.png"
                alt="Ovio Logo"
                style={{ maxWidth: "100%" }}
              />
            </IconButton>
          </a>
        </Box>
      </Box>
    </Drawer>
  );
};

const styles = () =>
  createStyles({
    paper: {
      width: "16rem",
      alignItems: "center",
      // paddingTop: "2rem",
      backgroundColor: "#095877",
    },
    buttonBox: {
      marginTop: "20px",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-evenly",
    },
  });

interface MenuDrawerIncomingProps {
  open: boolean;
  onClose: any;
}

type MenuDrawerProps = MenuDrawerIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(MenuDrawer);
