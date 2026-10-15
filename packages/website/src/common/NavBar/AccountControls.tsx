import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Divider, IconButton, Menu, MenuItem } from '@mui/material';
import Button from 'common/Button';
import { Link } from 'react-router-dom';
import DashboardTwoToneIcon from '@mui/icons-material/DashboardTwoTone';
import PublishIcon from '@mui/icons-material/Publish';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { sortBy } from 'lodash';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
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
import RegisterDialog from '../RegisterDialog';
import SignInDialog from '../SignInDialog';
import requests from '../../helpers/requests';

const managerLinks = [
  { to: '/uploads', label: 'Uploads', Icon: PublishIcon },
  { to: '/monitoring', label: 'Monitoring', Icon: EqualizerIcon },
];

export default function AccountControls() {
  const user = useSelector(userInfoSelector);
  const collection = useSelector(collectionDetailsSelector);
  const dispatch = useAppDispatch();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const canManage =
    user?.adminLevel === 'site_manager' || user?.adminLevel === 'super_admin';
  const accountLinks = [
    ...(canManage ? managerLinks : []),
    { to: '/dashboard', label: 'Dashboard', Icon: DashboardTwoToneIcon },
  ];

  const signOut = useCallback(() => {
    if (collection?.id === user?.collection?.id) dispatch(clearCollection());
    dispatch(signOutUser());
    setAnchor(null);
  }, [dispatch, collection?.id, user?.collection?.id]);

  const latestSignOut = useRef(signOut);
  const authFailureHandled = useRef(false);
  useLayoutEffect(() => {
    latestSignOut.current = signOut;
  }, [signOut]);
  useLayoutEffect(() => {
    // A new authenticated session can fail independently of the previous one.
    if (user?.id !== undefined) authFailureHandled.current = false;
  }, [user?.id, user?.token]);

  useEffect(() => {
    const lifecycle = { current: true };
    const interceptor = requests.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          lifecycle.current &&
          !authFailureHandled.current &&
          [401, 403].includes(error?.response?.status)
        ) {
          authFailureHandled.current = true;
          latestSignOut.current();
          setSignInOpen(true);
        }
        return Promise.reject(error);
      },
    );
    return () => {
      // Axios keeps a captured handler for requests already in flight.
      lifecycle.current = false;
      requests.axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

  const selectSite = () => {
    dispatch(unsetSelectedSite());
    dispatch(unsetSpotterPosition());
    dispatch(unsetLatestData());
    setAnchor(null);
  };

  return (
    <>
      {user ? (
        <div className="navbar__account">
          <span className="navbar__user-name">
            {user.fullName || 'My Profile'}
          </span>
          <IconButton
            className="navbar__account-toggle"
            aria-label="Open account menu"
            aria-expanded={Boolean(anchor)}
            onClick={(event) => setAnchor(event.currentTarget)}
          >
            <ExpandMoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchor}
            keepMounted
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
            MenuListProps={{ className: 'navbar-account-menu__list' }}
            PopoverClasses={{ paper: 'navbar-account-menu' }}
          >
            {sortBy(user.administeredSites, 'id').map(
              ({ id, name, region }, index) => (
                <MenuItem
                  component={Link}
                  to={`/sites/${id}`}
                  key={id}
                  onClick={selectSite}
                >
                  {name || region?.name || `Site ${index + 1}`}
                </MenuItem>
              ),
            )}
            {accountLinks.map(({ to, label, Icon }) => [
              <Divider key={`${to}-divider`} />,
              <MenuItem
                key={to}
                component={Link}
                to={to}
                onClick={() => setAnchor(null)}
              >
                <Icon fontSize="small" />
                {label}
              </MenuItem>,
            ])}
            <Divider />
            <MenuItem onClick={signOut}>
              <PowerSettingsNewIcon fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </div>
      ) : (
        <Button className="navbar__sign-in" onClick={() => setSignInOpen(true)}>
          Sign in
        </Button>
      )}
      <RegisterDialog
        open={registerOpen}
        handleRegisterOpen={setRegisterOpen}
        handleSignInOpen={setSignInOpen}
      />
      <SignInDialog
        open={signInOpen}
        handleRegisterOpen={setRegisterOpen}
        handleSignInOpen={setSignInOpen}
      />
    </>
  );
}
