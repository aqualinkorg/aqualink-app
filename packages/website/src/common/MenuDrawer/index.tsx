import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Link,
  Drawer,
  IconButton,
} from "@material-ui/core";
import { Clear } from "@material-ui/icons";

const menuRoutes = [
  {
    text: "Home",
    href: "/",
  },
  {
    text: "Buoy",
    href: "/buoy",
  },
  {
    text: "Drone",
    href: "/drones",
  },
  {
    text: "About",
    href: "/about",
  },
  {
    text: "FAQ",
    href: "/faq",
  },
  {
    text: "Apply",
    href: "/apply",
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
        }}
      >
        <Clear />
      </IconButton>
      {menuRoutes.map(({ text, href }) => (
        <Link
          href={href}
          style={{
            margin: "1rem 2rem 2rem",
            fontSize: "1.5rem",
            color: "white",
          }}
        >
          {text}
        </Link>
      ))}
    </Drawer>
  );
};

const styles = () =>
  createStyles({
    paper: {
      width: "12rem",
      alignItems: "center",
      // paddingTop: "2rem",
      backgroundColor: "#095877",
    },
  });

interface MenuDrawerIncomingProps {
  open: boolean;
  onClose: any;
}

type MenuDrawerProps = MenuDrawerIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(MenuDrawer);
