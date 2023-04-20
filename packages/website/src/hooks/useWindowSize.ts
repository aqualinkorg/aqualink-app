import { useState, useEffect, useCallback } from 'react';

interface WindowSize {
  height: number;
  width: number;
}

export const useWindowSize = (): WindowSize | undefined => {
  const [windowSize, setWindowSize] = useState<WindowSize>();

  const handleResize = useCallback(() => {
    setWindowSize({ height: window.innerHeight, width: window.innerWidth });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return windowSize;
};
