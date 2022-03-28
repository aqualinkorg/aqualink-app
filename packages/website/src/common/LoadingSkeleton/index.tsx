import React, { FC } from "react";
import { makeStyles, useTheme, useMediaQuery } from "@material-ui/core";
import { fade } from "@material-ui/core/styles/colorManipulator";
import { Skeleton, SkeletonProps } from "@material-ui/lab";
import random from "lodash/random";
import times from "lodash/times";
import classNames from "classnames";

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
}) => {
  const classes = useStyles({ image });
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
            animation="wave"
            className={classNames(classes.root, className, {
              [classes.dark]: dark,
            })}
            key={i}
            variant={variant}
            width={
              width ||
              `${random(
                longText || isMobile ? 50 : 20,
                longText || isMobile ? 100 : 40
              )}%`
            }
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
    backgroundColor: fade("#000000", 0.11),
  },
  image: ({ image }: Pick<LoadingSkeletonProps, "image">) =>
    image
      ? {
          backgroundImage: `
            linear-gradient(
              rgba(255, 255, 255, ${BACKGROUND_IMAGE_OPACITY}),
              rgba(255, 255, 255, ${BACKGROUND_IMAGE_OPACITY})
            ),
            url("${image}")
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(1)",
        }
      : {},
}));

interface LoadingSkeletonProps {
  loading?: boolean;
  variant?: SkeletonProps["variant"];
  width?: SkeletonProps["width"];
  height?: SkeletonProps["height"];
  lines?: number;
  image?: string;
  dark?: boolean;
  className?: string;
  longText?: boolean;
}

export default LoadingSkeleton;
