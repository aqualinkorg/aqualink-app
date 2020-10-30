import { CardIncomingProps } from "./Card";
import buoy from "../../assets/img/landing-page-buoy.jpg";
import metrics from "../../assets/img/landing-page-metrics.png";
import surveyImages from "../../assets/img/landing-page-survey-images.png";

export const cardTitles: CardIncomingProps[] = [
  {
    title: "Underwater temperature monitoring with a smart buoy",
    text:
      "There is some incredible existing technology that uses satellites to measure the ocean’s surface temperature from space. However, coral reefs and other important marine ecosystems are not always near the surface, and complex ocean dynamics can create a large temperature difference just a few meters down. To augment the satellite temperature, we partnered with Sofar Ocean to design a buoy that measures the temperature at the ocean floor. By building as many of these buoys as we can, and deploying them around the world, we can begin to build a dataset that helps in understanding where and when heat stress in the ocean will occur. By measuring, we can understand. And by understanding, we can begin to help.",
    backgroundColor: "rgba(69, 76, 79, 0.05)",
    direction: "row",
    image: buoy,
  },
  {
    title: "Each site gets its own web page",
    text:
      "For each site, with or without a buoy, we report the surface temperature as measured from satellite, along with the historical max for that specific site, the alert level, and a time-series plot of the temperature data. If a buoy can be deployed, we will make sure it happens.",
    backgroundColor: "#ffffff",
    direction: "row-reverse",
    image: metrics,
    scaleDown: true,
  },
  {
    title: "Correlate survey observations with temperature changes",
    text:
      "Each site on the Aqualink web app has a detailed page outlining the satellite data, buoy data, heat stress alert level, as well as weather and a time history of the temperature. But perhaps most importantly for the site manager, it provides the ability to upload survey imagery and correlate it with all the other data. When a user uploads imagery, it provides a snapshot in time of the measured temperature with visual observations. By tagging the images, we are beginning to create a structured database that future machine learning algorithms can use to help predict heat stress events, such as coral bleaching. Adding surveys also connects the local ecosystem manager to a global network of scientists and engineers that are working everyday to protect these sensitive environments. The datasets are free and available to everyone.",
    backgroundColor: "rgba(69, 76, 79, 0.05)",
    direction: "row",
    image: surveyImages,
    scaleDown: true,
  },
];
