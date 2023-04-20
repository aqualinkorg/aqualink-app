/* eslint-disable fp/no-mutation */
import { useState } from 'react';

export const useImageAspectRatio = (src: string): number | undefined => {
  const [aspectRatio, setAspectRatio] = useState<number>();

  const image = new Image();
  image.src = src;
  image.onload = () => setAspectRatio(image.width / image.height);

  return aspectRatio;
};
