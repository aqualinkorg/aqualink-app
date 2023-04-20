import { useEffect, useState } from 'react';

export function useBodyLength() {
  const [bodyLength, setBodyLength] = useState<string>();

  useEffect(() => {
    const onResize = () => {
      setBodyLength(`${document.documentElement.clientWidth}px`);
    };
    window.addEventListener('resize', onResize);
    // delay first run to give time for GUI to load
    const timeout = setTimeout(onResize, 1000);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', onResize);
    };
  }, [setBodyLength]);
  return bodyLength;
}
