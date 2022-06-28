export const getThumbnailBucketAndDestination = (url: string) => {
  // remove 'https://' from the string
  const trimmed = url.substring(8);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_domain, bucket, ...rest] = trimmed.split('/');
  const prefixed = `thumbnail-${rest.slice(-1)}`;
  const destination = [...rest.slice(0, -1), prefixed].join('/');

  return { bucket, destination };
};
