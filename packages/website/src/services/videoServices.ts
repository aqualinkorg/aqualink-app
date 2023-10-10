import { YoutubeDataAPI } from 'youtube-v3-api';

const youtubeApi = new YoutubeDataAPI(
  process.env.REACT_APP_FIREBASE_API_KEY || '',
);

export interface VideoInfo {
  id: string;
  snippet: {
    liveBroadcastContent: 'live' | 'none' | 'upcoming';
  };
}

export interface VideoQueryResponse {
  items?: VideoInfo[];
}

const getVideoInfo = (id: string): Promise<VideoQueryResponse> =>
  youtubeApi.searchVideo(id);

export default { getVideoInfo };
