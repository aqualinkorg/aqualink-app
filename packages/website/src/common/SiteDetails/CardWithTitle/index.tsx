import React, { PropsWithChildren } from 'react';
import { GridProps, Grid, Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import classNames from 'classnames';

import Title from './Title';
import { Value } from './types';
import LoadingSkeleton from '../../LoadingSkeleton';

function CardWithTitle({
  loading,
  gridProps,
  titleItems,
  rightHeaderItem = null,
  className,
  forcedAspectRatio,
  children,
  loadingImage,
}: PropsWithChildren<CardWithTitleProps>) {
  const classes = useStyles();

  return (
    <Grid className={className} container item {...gridProps}>
      {titleItems.length > 0 && (
        <Grid
          item
          xs={12}
          container
          alignItems="flex-end"
          className={classes.row}
        >
          <LoadingSkeleton loading={loading} variant="text" lines={1}>
            <Title values={titleItems} />
            {rightHeaderItem}
          </LoadingSkeleton>
        </Grid>
      )}
      <Grid
        item
        xs={12}
        className={classNames({
          [classes.forcedAspectRatioWrapper]: forcedAspectRatio,
        })}
      >
        <div
          className={
            forcedAspectRatio
              ? classes.absolutePositionedContainer
              : classes.container
          }
        >
          <LoadingSkeleton
            image={loadingImage}
            loading={loading}
            variant="rectangular"
            height="100%"
          >
            {children}
          </LoadingSkeleton>
        </div>
      </Grid>
    </Grid>
  );
}

const useStyles = makeStyles((theme: Theme) => {
  const aspectRatio = '16 / 9';

  return createStyles({
    forcedAspectRatioWrapper: {
      paddingTop: `calc((100% - ${theme.spacing(
        2,
      )}) / (${aspectRatio}) + ${theme.spacing(2)})`,
      marginTop: -theme.spacing(1),
      position: 'relative',
    },
    row: {
      margin: theme.spacing(0, 2, 1, 2),
    },
    container: {
      height: '30rem',
      [theme.breakpoints.only('md')]: {
        height: '25rem',
      },
      [theme.breakpoints.down('sm')]: {
        height: '20rem',
      },
    },
    absolutePositionedContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
  });
});

interface CardWithTitleProps {
  gridProps: GridProps;
  loading: boolean;
  titleItems: Value[];
  rightHeaderItem?: React.ReactNode;
  className?: string;
  forcedAspectRatio?: boolean;
  loadingImage?: string;
  children?: React.ReactNode;
}

export default CardWithTitle;
