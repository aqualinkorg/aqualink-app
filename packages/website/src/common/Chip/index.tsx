import React, { FC } from 'react';
import {
  Typography,
  Grid,
  Theme,
  makeStyles,
  createStyles,
  Button,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import { grey, green } from '@material-ui/core/colors';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chip: ({ width }: { width?: number }) => ({
      backgroundColor: grey[300],
      borderRadius: 8,
      height: 24,
      width,
      display: 'flex',
    }),
    chipText: {
      fontSize: 8,
      color: grey[600],
      [theme.breakpoints.between('md', 'md')]: {
        fontSize: 7,
      },
    },
    circle: {
      backgroundColor: green[300],
      borderRadius: '50%',
      height: 8.4,
      width: 8.4,
      marginRight: 5,
    },
    link: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      color: 'inherit',
      '&:hover': {
        textDecoration: 'none',
        color: 'inherit',
      },
    },
    sensorImage: {
      height: 18,
      width: 18,
    },
    button: {
      padding: 0,
      height: '100%',
    },
  }),
);

interface ChipProps {
  live?: boolean;
  href?: string;
  to?: string;
  liveText?: string;
  imageText?: string | null;
  image?: string | null;
  width?: number;
  onClick?: () => void;
}

const LinkWrapper: FC<
  Pick<ChipProps, 'to' | 'href'> & {
    className?: string;
    children?: React.ReactNode;
  }
> = ({ to, href, className, children }) => {
  const url = to || href;

  return url ? (
    <Link
      to={url}
      target={href ? '_blank' : undefined}
      className={className}
      rel="noopener noreferrer"
    >
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
};

const Chip = ({
  live,
  href,
  to,
  image,
  imageText,
  liveText,
  width,
  onClick,
}: ChipProps) => {
  const classes = useStyles({ width });
  return (
    <Grid className={classes.chip} item>
      <Grid container alignItems="center" justifyContent="center">
        <Button className={classes.button} onClick={onClick}>
          <LinkWrapper to={to} href={href} className={classes.link}>
            {live ? (
              <>
                <div className={classes.circle} />
                <Typography className={classes.chipText}>{liveText}</Typography>
              </>
            ) : (
              <>
                <Typography className={classes.chipText}>
                  {imageText}
                </Typography>
                {image && (
                  <img
                    className={classes.sensorImage}
                    alt="sensor-type"
                    src={image}
                  />
                )}
              </>
            )}
          </LinkWrapper>
        </Button>
      </Grid>
    </Grid>
  );
};

Chip.defaultProps = {
  live: false,
  href: undefined,
  to: undefined,
  imageText: undefined,
  image: undefined,
  liveText: 'LIVE',
  onClick: undefined,
};

export default Chip;
