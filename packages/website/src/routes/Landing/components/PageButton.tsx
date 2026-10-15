import React from 'react';
import Button from 'common/Button';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { GaAction, GaCategory, trackButtonClick } from 'utils/google-analytics';

export default function PageButton({
  outlined = false,
  children,
  to,
}: {
  outlined?: boolean;
  children: string;
  to: string;
}) {
  return (
    <Button
      component={Link}
      to={to}
      className="landing-page__button"
      variant={outlined ? 'outlined' : 'contained'}
      disableElevation
      endIcon={<ArrowForwardIcon />}
      onClick={() =>
        trackButtonClick(
          GaCategory.BUTTON_CLICK,
          GaAction.LANDING_PAGE_BUTTON_CLICK,
          children,
        )
      }
    >
      {children}
    </Button>
  );
}
