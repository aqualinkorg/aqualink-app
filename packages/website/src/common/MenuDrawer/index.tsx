import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Link,
  Drawer,
} from "@material-ui/core";

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
      className={classes.drawer}
    >
      {menuRoutes.map(({ text, href }) => (
        <Link href={href}>{text}</Link>
      ))}
    </Drawer>
  );
};

const styles = () =>
  createStyles({
    drawer: {
      width: 200,
    },
  });

interface MenuDrawerIncomingProps {
  open: boolean;
  onClose: any;
}

type MenuDrawerProps = MenuDrawerIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(MenuDrawer);
