import { YoutubeDataAPI } from "youtube-v3-api";

const youtubeApi = new YoutubeDataAPI(
  process.env.REACT_APP_FIREBASE_API_KEY || ""
);

export interface VideoInfo {
  id: string;
  snippet: {
    liveBroadcastContent: "live" | "none" | "upcoming";
  };
}

export interface VideoQueryResponse {
  items: VideoInfo[];
}

const getVideoInfo = (id: string) =>
  youtubeApi.searchVideo(id).then((data) => data as VideoQueryResponse);

export default { getVideoInfo };
