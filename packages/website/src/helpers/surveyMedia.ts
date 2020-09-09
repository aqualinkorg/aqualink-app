import type { SurveyPoint } from "../store/Survey/types";

export const getFeaturedMedia = (points: SurveyPoint[]) => {
  const point = points.find((pointItem) => {
    return pointItem.surveyMedia.find((media) => media.featured);
  });

  const media = point?.surveyMedia.find((mediaItem) => mediaItem.featured);

  return media?.url;
};

export const getNumberOfImages = (points: SurveyPoint[]) => {
  const imageMedia = points.map((point) => {
    return point.surveyMedia.filter((media) => media.type === "image").length;
  });

  return imageMedia.reduce((a, b) => a + b, 0);
};

export const getNumberOfVideos = (points: SurveyPoint[]) => {
  const videoMedia = points.map((point) => {
    return point.surveyMedia.filter((media) => media.type === "video").length;
  });

  return videoMedia.reduce((a, b) => a + b, 0);
};
