import { DeepPartial } from 'typeorm';
import { athensSite, californiaSite, floridaSite } from './site.mock';
import { SitePointOfInterest } from '../../src/site-pois/site-pois.entity';
import { createPoint } from '../../src/utils/coordinates';

export const athensPoiPiraeus: DeepPartial<SitePointOfInterest> = {
  imageUrl: 'http://some-sample-url.com',
  name: 'Piraeus',
  site: athensSite,
  polygon: createPoint(23.666694170726828, 37.92090950501416),
};

export const floridaPoiOne: DeepPartial<SitePointOfInterest> = {
  imageUrl: 'http://some-sample-url.com',
  name: 'Spot One',
  site: floridaSite,
  polygon: createPoint(-81.27384406004956, 24.617057340809524),
};

export const floridaPoiTwo: DeepPartial<SitePointOfInterest> = {
  imageUrl: 'http://some-sample-url.com',
  name: 'Spot Two',
  site: floridaSite,
  polygon: createPoint(-81.62632276694188, 24.966140159912975),
};

export const californiaPoi: DeepPartial<SitePointOfInterest> = {
  imageUrl: 'http://some-sample-url.com',
  name: 'California Poi',
  site: californiaSite,
  polygon: createPoint(-110.25009575059113, 24.647017162630366),
};

export const pois = [
  athensPoiPiraeus,
  floridaPoiOne,
  floridaPoiTwo,
  californiaPoi,
];
