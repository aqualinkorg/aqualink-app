import type { SurveyPoint } from "../store/Survey/types";

export const getFeaturedImage = (point: SurveyPoint) => {
  point.surveyMedia.find((media) => {
    return media.featured;
  });
};

export const getNumberOfImages = (points: SurveyPoint[]) => {
  let images = 0;
  for (let i = 0; i < points.length; i += 1) {
    images += points[i].surveyMedia.filter((media) => media.type === "image")
      .length;
  }
  return images;
};

export const getNumberOfVideos = (points: SurveyPoint[]) => {
  let videos = 0;
  for (let i = 0; i < points.length; i += 1) {
    videos += points[i].surveyMedia.filter((media) => media.type === "video")
      .length;
  }
  return videos;
};
