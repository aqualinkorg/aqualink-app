import React, { useEffect, useRef, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import Button from 'common/Button';
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
  const [compact, setCompact] = useState(false);
  const slot = useRef<HTMLDivElement>(null);
  const motion = useRef({
    value: 0,
    velocity: 0,
    target: 0,
    time: 0,
    frame: 0,
  });

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animate = (time: number) => {
      const { current } = motion;
      const delta = Math.min((time - current.time) / 1000, 0.064);
      // A critically damped spring settles quickly without bouncing the links.
      const frequency = 30;
      const offset = current.value - current.target;
      const impulse = current.velocity + frequency * offset;
      const decay = Math.exp(-frequency * delta);
      const value = current.target + (offset + impulse * delta) * decay;
      const velocity = (current.velocity - frequency * impulse * delta) * decay;
      const settled =
        Math.abs(value - current.target) < 0.001 && Math.abs(velocity) < 0.01;
      motion.current = {
        ...current,
        value: settled ? current.target : value,
        velocity: settled ? 0 : velocity,
        time,
        frame: settled ? 0 : window.requestAnimationFrame(animate),
      };
      setProgress(Math.min(1, Math.max(0, motion.current.value)));
    };
    const updateHeader = () => {
      // Keep the full header in its slot until it is entirely above the viewport.
      // Restore it immediately on the way up, independently of spring settling.
      const start = (slot.current?.offsetHeight || layoutTokens.navHeight) + 16;
      const distance = layoutTokens.navHeight * 0.5;
      const target = Math.min(
        1,
        Math.max(0, (window.scrollY - start) / distance),
      );
      setCompact(window.scrollY > start);
      if (reducedMotion.matches) {
        window.cancelAnimationFrame(motion.current.frame);
        motion.current = {
          value: target,
          velocity: 0,
          target,
          time: 0,
          frame: 0,
        };
        setProgress(target);
      } else {
        motion.current = { ...motion.current, target };
        if (!motion.current.frame && target !== motion.current.value) {
          motion.current = {
            ...motion.current,
            time: performance.now(),
            frame: window.requestAnimationFrame(animate),
          };
        }
      }
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    window.addEventListener('resize', updateHeader);
    reducedMotion.addEventListener('change', updateHeader);
    return () => {
      window.removeEventListener('scroll', updateHeader);
      window.removeEventListener('resize', updateHeader);
      reducedMotion.removeEventListener('change', updateHeader);
      window.cancelAnimationFrame(motion.current.frame);
      motion.current = { ...motion.current, frame: 0 };
    };
  }, []);
  const [, setTranslationOpen] = useGoogleTranslation();

  return (
    <>
      <div
        ref={slot}
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
