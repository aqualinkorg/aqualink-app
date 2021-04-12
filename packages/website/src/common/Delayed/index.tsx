import { useState, useEffect } from "react";

type DelayedProps = {
  children: JSX.Element;
  waitBeforeShow?: number;
};

const Delayed = ({ children, waitBeforeShow = 500 }: DelayedProps) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);
  }, [waitBeforeShow]);

  return isShown ? children : null;
};

export default Delayed;
