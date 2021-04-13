import { useState, useEffect } from "react";

type DelayedProps = {
  children: JSX.Element;
  waitBeforeShow?: number;
};

const Delayed = ({ children, waitBeforeShow = 500 }: DelayedProps) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);
    return () => clearTimeout(timeout);
  }, [waitBeforeShow]);

  return isShown ? children : null;
};

export default Delayed;
