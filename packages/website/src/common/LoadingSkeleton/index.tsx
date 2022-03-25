import React, { FC } from "react";
import { makeStyles, useTheme, useMediaQuery } from "@material-ui/core";
import { fade } from "@material-ui/core/styles/colorManipulator";
import { Skeleton, SkeletonProps } from "@material-ui/lab";
import random from "lodash/random";
import times from "lodash/times";

import chartSkeletonImage from "../../assets/img/chart_skeleton.png";

const LoadingSkeleton: FC<LoadingSkeletonProps> = ({
  loading,
  children,
  variant,
  width,
  height,
  lines,
  isChart,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
  const rectSkeletonProps: SkeletonProps =
    variant === "rect" &&
    (typeof width !== "undefined" || typeof height !== "undefined")
      ? { width, height }
      : {};

  if (!loading) {
    return <>{children}</>;
  }

  if (variant === "text" && typeof lines === "number") {
    return (
      <>
        {times(lines).map((i) => (
          <Skeleton
            className={classes.root}
            key={i}
            variant={variant}
            width={`${random(isMobile ? 50 : 20, isMobile ? 100 : 40)}%`}
          />
        ))}
      </>
    );
  }

  return (
    <Skeleton className={classes.root} variant={variant} {...rectSkeletonProps}>
      {isChart ? (
        <img
          src={chartSkeletonImage}
          alt="chart-skeleton"
          className={classes.chartSkeletonImage}
        />
      ) : null}
    </Skeleton>
  );
};

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: fade("#000000", 0.11),
    borderRadius: 4,
  },
  chartSkeletonImage: {
    visibility: "visible",
    width: "100%",
    height: "100%",
    opacity: 0.3,
    filter: "grayscale(1)",
  },
}));

interface LoadingSkeletonProps {
  loading: boolean;
  variant?: SkeletonProps["variant"];
  width?: SkeletonProps["width"];
  height?: SkeletonProps["height"];
  lines?: number;
  isChart?: boolean;
}

export default LoadingSkeleton;
