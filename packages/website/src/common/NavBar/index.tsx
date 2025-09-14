import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Grid,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem,
  Link as MuiLink,
  Box,
  Hidden,
  Theme,
  useTheme,
  useMediaQuery,
  Divider,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { Link } from 'react-router-dom';
import DashboardTwoToneIcon from '@mui/icons-material/DashboardTwoTone';
import PublishIcon from '@mui/icons-material/Publish';
import MenuIcon from '@mui/icons-material/Menu';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { sortBy } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import LanguageIcon from '@mui/icons-material/Language';
import { userInfoSelector, signOutUser } from 'store/User/userSlice';
import {
  clearCollection,
  collectionDetailsSelector,
} from 'store/Collection/collectionSlice';
import {
  unsetLatestData,
  unsetSpotterPosition,
  unsetSelectedSite,
} from 'store/Sites/selectedSiteSlice';
import { useGoogleTranslation } from 'utils/google-translate';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import RegisterDialog from '../RegisterDialog';
import SignInDialog from '../SignInDialog';
import Search from '../Search';
import RouteButtons from '../RouteButtons';
import MenuDrawer from '../MenuDrawer';
import requests from '../../helpers/requests';

function NavBar({
  searchLocation,
  geocodingEnabled = false,
  routeButtons = false,
  loading = false,
  classes,
}: NavBarProps) {
  const user = useSelector(userInfoSelector);
  const storedCollection = useSelector(collectionDetailsSelector);
  const dispatch = useDispatch();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.up('md'));
  const [registerDialogOpen, setRegisterDialogOpen] = useState<boolean>(false);
  const [signInDialogOpen, setSignInDialogOpen] = useState<boolean>(false);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [, setTranslationOpen] = useGoogleTranslation();

  const handleRegisterDialog = (open: boolean) => setRegisterDialogOpen(open);
  const handleSignInDialog = React.useCallback(
    (open: boolean) => {
      setSignInDialogOpen(open);
    },
    [setSignInDialogOpen],
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const onUserSignOut = React.useCallback(() => {
    // Clear collection if it belongs to the signed in user
    if (storedCollection?.id === user?.collection?.id) {
      dispatch(clearCollection());
    }
    dispatch(signOutUser());
    handleMenuClose();
  }, [dispatch, storedCollection?.id, user?.collection?.id]);

  const onSiteChange = () => {
    dispatch(unsetSelectedSite());
    dispatch(unsetSpotterPosition());
    dispatch(unsetLatestData());
  };

  React.useEffect(() => {
    const responseInterceptor =
      requests.axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
          if ([401, 403].includes(error?.response?.status)) {
            onUserSignOut();
            // temporarily log server errors here to investigate
            // potential erroneous 403 errors.
            console.error(error);
            await new Promise((resolve) => {
              setTimeout(resolve, 0);
            });
            handleSignInDialog(true);
          }
          return Promise.reject(error);
        },
      );

    return () => {
      requests.axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [handleSignInDialog, onUserSignOut]);

  return (
    <>
      <AppBar
        className={classNames(classes.appBar, {
          [classes.appBarXs]: searchLocation,
        })}
        position="static"
        color="primary"
      >
        <Toolbar className={classes.toolbar}>
          <MenuDrawer
            open={menuDrawerOpen}
            onClose={() => setMenuDrawerOpen(false)}
          />
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Grid
              item
              xs={4}
              sm={2}
              // eslint-disable-next-line no-nested-ternary
              md={routeButtons ? 2 : searchLocation ? 6 : 4}
            >
              <Box display="flex" flexWrap="nowrap" alignItems="center">
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={() => setMenuDrawerOpen(true)}
                  size="large"
                >
                  <MenuIcon />
                </IconButton>

                <MuiLink
                  className={classes.navBarLink}
                  href="/map"
                  underline="hover"
                >
                  <Typography color="textPrimary" variant="h4">
                    Aqua
                  </Typography>
                  <Typography style={{ color: '#8AC6DE' }} variant="h4">
                    link
                  </Typography>
                </MuiLink>
              </Box>
            </Grid>

            {searchLocation && (
              <Hidden smDown>
                <Grid item sm={4} md={3}>
                  <Search geocodingEnabled={geocodingEnabled} />
                </Grid>
              </Hidden>
            )}

            {routeButtons && isTablet && <RouteButtons />}

            <Grid
              container
              justifyContent="flex-end"
              item
              xs={8}
              sm={routeButtons && isTablet ? 3 : 4}
              md={searchLocation || (routeButtons && isTablet) ? 3 : 8}
              className={classes.languageUserWrapper}
            >
              <Tooltip title="Translate">
                <IconButton
                  style={{ color: 'white' }}
                  onClick={() => setTranslationOpen((prev) => !prev)}
                  size="large"
                >
                  <LanguageIcon />
                </IconButton>
              </Tooltip>
              {user ? (
                <Box display="flex" flexWrap="nowrap" alignItems="center">
                  {user.fullName ? user.fullName : 'My Profile'}
                  <IconButton
                    className={classes.button}
                    onClick={handleClick}
                    size="large"
                  >
                    <ExpandMoreIcon className={classes.expandIcon} />
                  </IconButton>
                  <Menu
                    key="user-menu"
                    className={classes.userMenu}
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    MenuListProps={{ className: classes.userMenu }}
                    PopoverClasses={{ paper: classes.userMenuWrapper }}
                  >
                    {sortBy(user.administeredSites, 'id').map(
                      ({ id, name, region }, index) => {
                        const siteIdentifier = name || region?.name;
                        return (
                          <Link
                            to={`/sites/${id}`}
                            key={`site-link-${id}`}
                            className={classes.menuItemLink}
                          >
                            <MenuItem
                              onClick={() => onSiteChange()}
                              className={classes.menuItem}
                            >
                              {siteIdentifier || `Site ${index + 1}`}
                            </MenuItem>
                          </Link>
                        );
                      },
                    )}
                    {user &&
                      (user.adminLevel === 'site_manager' ||
                        user.adminLevel === 'super_admin') && (
                        <div>
                          <Divider className={classes.userMenuDivider} />
                          <Link to="/uploads" className={classes.menuItemLink}>
                            <MenuItem
                              key="user-menu-uploads"
                              className={classes.menuItem}
                            >
                              <Grid container spacing={1}>
                                <Grid item>
                                  <PublishIcon fontSize="small" />
                                </Grid>
                                <Grid item>Uploads</Grid>
                              </Grid>
                            </MenuItem>
                          </Link>
                        </div>
                      )}
                    {user &&
                      (user.adminLevel === 'site_manager' ||
                        user.adminLevel === 'super_admin') && (
                        <div>
                          <Divider className={classes.userMenuDivider} />
                          <Link
                            to="/monitoring"
                            className={classes.menuItemLink}
                          >
                            <MenuItem
                              key="user-menu-monitoring"
                              className={classes.menuItem}
                            >
                              <Grid container spacing={1}>
                                <Grid item>
                                  <EqualizerIcon fontSize="small" />
                                </Grid>
                                <Grid item>Monitoring</Grid>
                              </Grid>
                            </MenuItem>
                          </Link>
                        </div>
                      )}
                    <Divider className={classes.userMenuDivider} />
                    <Link to="/dashboard" className={classes.menuItemLink}>
                      <MenuItem
                        key="user-menu-dashboard"
                        className={classes.menuItem}
                      >
                        <Grid container spacing={1}>
                          <Grid item>
                            <DashboardTwoToneIcon fontSize="small" />
                          </Grid>
                          <Grid item>Dashboard</Grid>
                        </Grid>
                      </MenuItem>
                    </Link>
                    <Divider className={classes.userMenuDivider} />
                    <MenuItem
                      key="user-menu-logout"
                      className={classes.menuItem}
                      onClick={onUserSignOut}
                    >
                      <Grid container spacing={1}>
                        <Grid item>
                          <PowerSettingsNewIcon fontSize="small" />
                        </Grid>
                        <Grid item>Logout</Grid>
                      </Grid>
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <div style={{ display: 'flex' }}>
                  <Button
                    color="inherit"
                    onClick={() => handleSignInDialog(true)}
                  >
                    SIGN IN
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => handleRegisterDialog(true)}
                  >
                    SIGN UP
                  </Button>
                </div>
              )}
            </Grid>

            {searchLocation && (
              <Hidden smUp>
                <Grid item xs={12} style={{ margin: 0, paddingTop: 0 }}>
                  <Search geocodingEnabled={geocodingEnabled} />
                </Grid>
              </Hidden>
            )}
          </Grid>
        </Toolbar>
      </AppBar>
      {loading && <LinearProgress />}
      <RegisterDialog
        open={registerDialogOpen}
        handleRegisterOpen={handleRegisterDialog}
        handleSignInOpen={handleSignInDialog}
      />
      <SignInDialog
        open={signInDialogOpen}
        handleRegisterOpen={handleRegisterDialog}
        handleSignInOpen={handleSignInDialog}
      />
    </>
  );
}

const styles = (theme: Theme) =>
  createStyles({
    appBar: {
      height: 64,
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
    appBarXs: {
      [theme.breakpoints.only('xs')]: {
        height: 122,
      },
    },
    toolbar: {
      padding: theme.spacing(0, 1),
    },
    userMenuWrapper: {
      marginTop: 8,
      border: '1px solid rgba(0, 0, 0, 0.12)',
      maxWidth: 275,
    },
    userMenuDivider: {
      margin: '4px 0',
    },
    userMenu: {
      padding: '4px 0',
    },
    menuItem: {
      margin: 0,
      color: theme.palette.text.secondary,
      fontSize: 14,
      display: 'block',
      overflowWrap: 'break-word',
      whiteSpace: 'unset',
      '&:hover': {
        backgroundColor: 'rgba(22, 141, 189, 0.8)',
        color: theme.palette.text.primary,
      },
      minHeight: 'auto',
    },
    menuItemLink: {
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'none',
      },
    },
    expandIcon: {
      color: '#ffffff',
    },
    button: {
      padding: theme.spacing(1),
      marginLeft: '1rem',
    },
    languageUserWrapper: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
    },
  });

interface NavBarIncomingProps {
  searchLocation: boolean;
  geocodingEnabled?: boolean;
  routeButtons?: boolean;
  loading?: boolean;
}

type NavBarProps = NavBarIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(NavBar);
