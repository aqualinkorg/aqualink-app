import ReactGA from "react-ga";

const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID || "";
if (process.env.IS_PROD && !GA_TRACKING_ID) {
  throw new Error(
    "You appear to be trying to do a production build, but no Google Analytics" +
      " tracking id was provided!\nEither set GA_TRACKING_ID as an env variable, or set up a" +
      " .env.prod file."
  );
}

export const initGA = () => {
  ReactGA.initialize(GA_TRACKING_ID);
  ReactGA.pageview(window.location.pathname + window.location.search);
};

export enum GaCategory {
  BUTTON_CLICK = "Button Click",
}

export enum GaAction {
  // Button clicks
  LANDING_PAGE_BUTTON_CLICK = "Landing page button click",
  SIDE_MENU_BUTTON_CLICK = "Side menu button click",
  MAP_PAGE_BUTTON_CLICK = "Map page button click",
}

export const trackButtonClick = (
  category: GaCategory,
  action: GaAction,
  label?: string
) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
