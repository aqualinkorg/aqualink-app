export const getImageAspectRatio = (src: string) => {
  const img = new Image();
  // eslint-disable-next-line fp/no-mutation
  img.src = src;

  return img.width / img.height;
};
