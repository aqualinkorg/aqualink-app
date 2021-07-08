// Use require because of TS issues...
// https://github.com/niieani/hashids.js/issues/210
const Hashids = require('hashids/cjs');

const hasher = new Hashids(process.env.URL_SALT || process.env.APP_SECRET, 10);

export const hashId = (id: number) => hasher.encode(id);
export const idFromHash = (hash: string) => hasher.decode(hash)[0];
// Check to see if an id is valid - basically it must be an integer string with no extra characters
export const isValidId = (id: string) => id.match(/^[0-9]+$/);

// Get YouTube ID from various YouTube URL
// Source: https://gist.github.com/takien/4077195
// Works for the following url formats:
// - https://youtu.be/videoID
// - https://www.youtube.com/embed/videoID
// - https://www.youtube.com/watch/?v=videoID

export const getYouTubeVideoId = (url: string) => {
  const parsedUrl = url
    .replace(/(>|<)/gi, '')
    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);

  if (parsedUrl[2] !== undefined) {
    const id = parsedUrl[2].split(/[^0-9a-z_-]/i);
    return id[0];
  }

  return undefined;
};
