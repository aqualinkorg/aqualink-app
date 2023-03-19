import React from "react";
import ReactGA from "react-ga4";

const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID || "";
if (process.env.IS_PROD && !GA_TRACKING_ID) {
  throw new Error(
    "You appear to be trying to do a production build, but no Google Analytics" +
      " tracking id was provided!\nEither set GA_TRACKING_ID as an env variable, or set up a" +
      " .env.prod file."
  );
}

const googleAnalyticsTagManagerID =
  process.env.REACT_APP_GA_TAG_MANAGER_ID || "";
if (process.env.IS_PROD && !GA_TRACKING_ID) {
  throw new Error(
    "You appear to be trying to do a production build, but no Google Analytics" +
      " tag manager id was provided!\nEither set REACT_APP_GA_TAG_MANAGER_ID as an env variable, or set up a" +
      " .env.prod file."
  );
}

export const useGATagManager = () => {
  const getScript = () => `
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({"gtm.start": new Date().getTime(), event:"gtm.js"});
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
      f.parentNode.insertBefore(j,f);
    })(
      window,
      document,
      "script",
      "dataLayer",
      "${googleAnalyticsTagManagerID}",
    );
  `;

  React.useEffect(() => {
    const script = document.createElement("script");
    // eslint-disable-next-line fp/no-mutation
    script.innerHTML = getScript();
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleAnalyticsTagManagerID]);
};

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
