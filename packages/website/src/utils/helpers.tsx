export const getThumbnailLink = (url: string) => {
  const s = url.split("/");
  // eslint-disable-next-line fp/no-mutation
  s[s.length - 1] = `thumbnail-${s[s.length - 1]}`;
  return s.join("/");
};
