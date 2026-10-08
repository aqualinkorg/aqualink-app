import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LanguageIcon from '@mui/icons-material/Language';
import classNames from 'classnames';
import { useGoogleTranslation } from 'utils/google-translate';
import Search from '../Search';
import RouteButtons from '../RouteButtons';
import MenuDrawer from '../MenuDrawer';
import AccountControls from './AccountControls';
import layoutTokens from '../../styles/tokens.json';
import './NavBar.scss';

interface NavBarProps {
  searchLocation: boolean;
  geocodingEnabled?: boolean;
  routeButtons?: boolean;
  loading?: boolean;
}

export default function NavBar({
  searchLocation,
  geocodingEnabled = false,
  routeButtons = false,
  loading = false,
}: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const compact = progress > 0;

  useEffect(() => {
    const updateHeader = () => {
      const start = layoutTokens.navHeight * 0.75;
      const distance = layoutTokens.navHeight * 1.25;
      setProgress(
        Math.min(1, Math.max(0, (window.scrollY - start) / distance)),
      );
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, []);
  const [, setTranslationOpen] = useGoogleTranslation();

  return (
    <>
      <div
        className={classNames('navbar-slot', {
          'navbar-slot--search': searchLocation,
        })}
      >
        <AppBar
          className={classNames('navbar', {
            'navbar--search': searchLocation,
            'navbar--compact': compact,
          })}
          // Only the live scroll value belongs in JS; all visual styles stay in Sass.
          style={{ '--navbar-progress': progress } as React.CSSProperties}
          position="static"
        >
          <Toolbar className="navbar__toolbar">
            <div className="navbar__content">
              <div className="navbar__brand">
                <IconButton
                  className={classNames('navbar__menu-toggle', {
                    'navbar__menu-toggle--mobile': routeButtons || compact,
                  })}
                  color="inherit"
                  aria-label="Open navigation menu"
                  onClick={() => setMenuOpen(true)}
                >
                  <MenuIcon />
                </IconButton>
                <Link
                  className="navbar__logo"
                  to="/"
                  aria-label="Aqualink home"
                >
                  Aqua<span>link</span>
                </Link>
              </div>
              {searchLocation && (
                <div className="navbar__desktop-search">
                  <Search geocodingEnabled={geocodingEnabled} />
                </div>
              )}
              {(routeButtons || compact) && <RouteButtons compact={compact} />}
              <div className="navbar__actions">
                <Tooltip title="Translate">
                  <IconButton
                    className="navbar__language"
                    aria-label="Translate"
                    onClick={() => setTranslationOpen((prev) => !prev)}
                    size="large"
                  >
                    <LanguageIcon />
                  </IconButton>
                </Tooltip>
                <AccountControls />
                <Button
                  className="navbar__register"
                  component={Link}
                  to="/register"
                  variant="contained"
                  disableElevation
                  endIcon={<ArrowForwardIcon />}
                >
                  Register your site
                </Button>
              </div>
              {searchLocation && (
                <div className="navbar__mobile-search">
                  <Search geocodingEnabled={geocodingEnabled} />
                </div>
              )}
            </div>
          </Toolbar>
        </AppBar>
      </div>
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      {loading && <LinearProgress />}
    </>
  );
}
