import React, { FC, useEffect, useState } from 'react';
import { makeStyles, useTheme, useMediaQuery } from '@material-ui/core';
import { alpha } from '@material-ui/core/styles/colorManipulator';
import { Skeleton, SkeletonProps } from '@material-ui/lab';
import random from 'lodash/random';
import times from 'lodash/times';
import classNames from 'classnames';

const BACKGROUND_IMAGE_OPACITY = 0.3;

const LoadingSkeleton: FC<LoadingSkeletonProps> = ({
  loading,
  children,
  variant,
  width,
  height,
  lines,
  image,
  dark = true,
  className,
  longText,
  textHeight,
}) => {
  const classes = useStyles({ image, textHeight });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const [lineWidths, setLineWidths] = useState<
    { key: number; width: number }[]
  >([]);
  const rectSkeletonProps: SkeletonProps =
    variant === 'rect' &&
    (typeof width !== 'undefined' || typeof height !== 'undefined')
      ? { width, height }
      : {};

  useEffect(() => {
    if (typeof lines === 'number') {
      setLineWidths(
        times(lines, (i) => ({
          key: i,
          width: random(
            longText || isMobile ? 50 : 20,
            longText || isMobile ? 100 : 40,
          ),
        })),
      );
    }
  }, [isMobile, lines, longText]);

  if (!loading) {
    return <>{children}</>;
  }

  if (variant === 'text' && typeof lines === 'number' && lineWidths.length) {
    return (
      <>
        {lineWidths.map(({ key, width: lineWidth }) => (
          <Skeleton
            animation="wave"
            className={classNames(classes.root, classes.textHeight, className, {
              [classes.dark]: dark,
            })}
            key={key}
            variant={variant}
            width={width || `${lineWidth}%`}
          />
        ))}
      </>
    );
  }

  return (
    <Skeleton
      animation="wave"
      className={classNames(classes.root, classes.image, className, {
        [classes.dark]: dark,
      })}
      variant={variant}
      {...rectSkeletonProps}
    />
  );
};

const useStyles = makeStyles(() => ({
  root: {
    borderRadius: 4,
  },
  dark: {
    backgroundColor: alpha('#000000', 0.11),
  },
  textHeight: ({ textHeight }: LoadingSkeletonStyleProps) =>
    typeof textHeight !== 'undefined'
      ? {
          height: textHeight,
        }
      : {},
  image: ({ image }: LoadingSkeletonStyleProps) =>
    image
      ? {
          backgroundImage: `
            linear-gradient(
              rgba(255, 255, 255, ${BACKGROUND_IMAGE_OPACITY}),
              rgba(255, 255, 255, ${BACKGROUND_IMAGE_OPACITY})
            ),
            url("${image}")
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(1)',
        }
      : {},
}));

interface LoadingSkeletonProps {
  loading?: boolean;
  variant?: SkeletonProps['variant'];
  width?: SkeletonProps['width'];
  height?: SkeletonProps['height'];
  lines?: number;
  image?: string;
  dark?: boolean;
  className?: string;
  longText?: boolean;
  textHeight?: SkeletonProps['height'];
}

type LoadingSkeletonStyleProps = Pick<
  LoadingSkeletonProps,
  'textHeight' | 'image'
>;

export default LoadingSkeleton;
