import React, { useState, useEffect, PropsWithChildren } from 'react';

type DelayedProps = {
  waitBeforeShow?: number;
};

const Delayed = ({
  children,
  waitBeforeShow = 500,
}: PropsWithChildren<DelayedProps>) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);
    return () => clearTimeout(timeout);
  }, [waitBeforeShow]);

  return <>{isShown ? children : null}</>;
};

export default Delayed;
