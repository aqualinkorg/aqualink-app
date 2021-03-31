declare module "*.png";
declare module "*.jpg";

// Generic CSS import definition
declare module "*.css" {
  interface IClassNames {
    [className: string]: string;
  }
  const classNames: IClassNames;
  export = classNames;
}

declare module "download-csv";
declare module "react-leaflet-markercluster";
declare module "react-swipeable-bottom-sheet";
