import { last } from "lodash";

export const getYouTubeVideoId = (url?: string | null) => last(url?.split("/"));
