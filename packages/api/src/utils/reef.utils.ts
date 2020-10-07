import {
  Client,
  AddressType,
  GeocodeResult,
} from '@googlemaps/google-maps-services-js';
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Point } from 'geojson';
import geoTz from 'geo-tz';
import { Region } from '../regions/regions.entity';

const googleMapsClient = new Client({});
const logger = new Logger('Reef Utils');

const getLocality = (results: GeocodeResult[]) => {
  const localityPreference = [
    'administrative_area_level_2',
    'administrative_area_level_1',
    'locality',
    'country',
  ] as AddressType[];

  if (results.length === 0) {
    return undefined;
  }

  const result = localityPreference.reduce(
    (tempResult: GeocodeResult | undefined, locality) => {
      const localityResult = results.find((r) => r.types.includes(locality));
      return tempResult || localityResult;
    },
    undefined,
  );
  return result ? result.formatted_address : results[0].formatted_address;
};

export const getGoogleRegion = async (
  longitude: number,
  latitude: number,
): Promise<string | undefined> => {
  return googleMapsClient
    .reverseGeocode({
      params: {
        latlng: [latitude, longitude],
        result_type: [AddressType.country],
        key: process.env.GOOGLE_MAPS_API_KEY || '',
      },
    })
    .then((r) => {
      const { results } = r.data;
      return getLocality(results);
    })
    .catch((e) => {
      logger.error(
        e.response
          ? e.response.data.error_message
          : 'An unknown error occurred.',
        e,
      );
      return undefined;
    });
};

export const getRegion = async (
  longitude: number,
  latitude: number,
  regionRepository: Repository<Region>,
) => {
  const country = await getGoogleRegion(longitude, latitude);
  const region = await regionRepository.findOne({ where: { name: country } });

  if (region) {
    return region;
  }

  return country
    ? regionRepository.save({
        name: country,
        polygon: {
          coordinates: [longitude, latitude],
          type: 'Point',
        } as Point,
      })
    : undefined;
};

export const getTimezones = (latitude: number, longitude: number) => {
  return geoTz(latitude, longitude);
};
