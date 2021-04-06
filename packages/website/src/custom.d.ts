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

declare module "download-csv" {
  // These types are for our use-case and are in no way representative of the real library
  // Real types: https://github.com/AllenZeng/download-csv#readme
  // eslint-disable-next-line no-inner-declarations
  export default function <K>(
    data: Array<{ [k in K]?: any }>,
    headersMap?: { [k in K]?: string },
    fileName?: string
  ) {}
}
declare module "react-leaflet-markercluster";
declare module "react-swipeable-bottom-sheet";
