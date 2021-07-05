import { useEffect, useState } from "react";
import videoServices from "../services/videoServices";

export const useLiveStreamCheck = (videoId?: string | null): boolean => {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (videoId) {
      videoServices
        .getVideoInfo(videoId)
        .then(({ items }) =>
          setIsLive(items?.[0]?.snippet?.liveBroadcastContent === "live")
        );
    }
  }, [videoId]);

  return isLive;
};
