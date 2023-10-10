import React, { FC, PropsWithChildren } from 'react';
import {
  makeStyles,
  createStyles,
  GridProps,
  Grid,
  Theme,
} from '@material-ui/core';
import classNames from 'classnames';

import Title from './Title';
import { Value } from './types';
import LoadingSkeleton from '../../LoadingSkeleton';

const CardWithTitle: FC<CardWithTitleProps> = ({
  loading,
  gridProps,
  titleItems,
  className,
  forcedAspectRatio,
  children,
  loadingImage,
}: PropsWithChildren<CardWithTitleProps>) => {
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
            variant="rect"
            height="100%"
          >
            {children}
          </LoadingSkeleton>
        </div>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme: Theme) => {
  const aspectRatio = '16 / 9';

  return createStyles({
    forcedAspectRatioWrapper: {
      paddingTop: `calc((100% - ${theme.spacing(
        2,
      )}px) / (${aspectRatio}) + ${theme.spacing(2)}px)`,
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
      [theme.breakpoints.down('xs')]: {
        height: '20rem',
      },
    },
    absolutePositionedContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      padding: theme.spacing(1),
      width: '100%',
      height: '100%',
    },
  });
});

interface CardWithTitleProps {
  gridProps: GridProps;
  loading: boolean;
  titleItems: Value[];
  className?: string;
  forcedAspectRatio?: boolean;
  loadingImage?: string;
}

export default CardWithTitle;
