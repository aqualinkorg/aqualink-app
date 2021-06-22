import { DeepPartial } from 'typeorm';
import { athensReef } from './reef.mock';
import { ReefPointOfInterest } from '../../src/reef-pois/reef-pois.entity';
import { createPoint } from '../../src/utils/coordinates';

export const athensPoiPiraeus: DeepPartial<ReefPointOfInterest> = {
  imageUrl: 'http://some-sample-url.com',
  name: 'Piraeus',
  reef: athensReef,
  polygon: createPoint(23.666694170726828, 37.92090950501416),
};

export const pois = [athensPoiPiraeus];
