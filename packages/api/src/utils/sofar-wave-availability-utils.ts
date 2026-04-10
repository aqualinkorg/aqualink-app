/* eslint-disable fp/no-mutating-methods */
import { Logger } from '@nestjs/common';
import fs from 'fs';
import { Point } from 'geojson';
import { Repository } from 'typeorm';
import { join } from 'path';
import { Site } from '../sites/sites.entity';
import { createPoint } from './coordinates';

const GRID_ROWS = 721;
const GRID_COLS = 1440;
const CELL_SIZE = 0.25;
const LAT_MIN = -90;
const MAX_SEARCH_RADIUS = 20;
const STALE_DATA_DAYS = 2;

const COMPACT_FILE_PATH = join(__dirname, '../../assets/sofar-wave-mask.bin');

type WaveMask = number[][];

export function getWaveMaskFromFile(): WaveMask {
  Logger.log('Getting Sofar wave mask from local file...');

  const data = fs.readFileSync(COMPACT_FILE_PATH);
  const rows = data.readUInt32BE(0);
  const cols = data.readUInt32BE(4);

  const flat = Array.from(data.slice(8));
  const mask = Array.from({ length: rows }, (_, r) =>
    flat.slice(r * cols, (r + 1) * cols),
  );

  Logger.log(`Loaded wave mask: ${rows}×${cols} grid`);
  return mask;
}

function snapToGrid(lat: number, lon: number): { row: number; col: number } {
  const row = Math.round((lat - LAT_MIN) / CELL_SIZE);
  const lon360 = ((lon % 360) + 360) % 360;
  const col = Math.round(lon360 / CELL_SIZE) % GRID_COLS;
  return {
    row: Math.max(0, Math.min(GRID_ROWS - 1, row)),
    col,
  };
}

function gridToLatLon(row: number, col: number): { lat: number; lon: number } {
  const lat = LAT_MIN + row * CELL_SIZE;
  const lon360 = col * CELL_SIZE;
  const lon = lon360 > 180 ? lon360 - 360 : lon360;
  return { lat, lon };
}

function wrapLongitudeDiff(diff: number): number {
  if (diff > 180) return diff - 360;
  if (diff < -180) return diff + 360;
  return diff;
}

function distanceDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = lat2 - lat1;
  const dLon = wrapLongitudeDiff(lon2 - lon1);
  const cosLat = Math.cos((lat1 * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLon * cosLat * (dLon * cosLat));
}

function getRadiusOffsets(radius: number): [number, number][] {
  if (radius === 0) return [[0, 0]];

  const topRow = Array.from(
    { length: 2 * radius + 1 },
    (_, i) => [-radius, i - radius] as [number, number],
  );
  const bottomRow = Array.from(
    { length: 2 * radius + 1 },
    (_, i) => [radius, i - radius] as [number, number],
  );
  const leftCol = Array.from(
    { length: 2 * radius - 1 },
    (_, i) => [i - radius + 1, -radius] as [number, number],
  );
  const rightCol = Array.from(
    { length: 2 * radius - 1 },
    (_, i) => [i - radius + 1, radius] as [number, number],
  );

  return [...topRow, ...bottomRow, ...leftCol, ...rightCol];
}

export function getNearestWaterPoint(
  siteLat: number,
  siteLon: number,
  mask: WaveMask,
): { lat: number; lon: number } | null {
  const { row: originRow, col: originCol } = snapToGrid(siteLat, siteLon);

  const result = Array.from(
    { length: MAX_SEARCH_RADIUS + 1 },
    (_, i) => i,
  ).reduce<{ lat: number; lon: number } | null>((found, radius) => {
    if (found) return found;

    const waterCells = getRadiusOffsets(radius)
      .map(([dr, dc]) => ({
        r: originRow + dr,
        c: (((originCol + dc) % GRID_COLS) + GRID_COLS) % GRID_COLS,
      }))
      .filter(({ r }) => r >= 0 && r < GRID_ROWS)
      .filter(({ r, c }) => mask[r][c] === 1)
      .map(({ r, c }) => gridToLatLon(r, c));

    if (waterCells.length === 0) return null;

    return waterCells.reduce((best, cell) =>
      distanceDeg(siteLat, siteLon, cell.lat, cell.lon) <
      distanceDeg(siteLat, siteLon, best.lat, best.lon)
        ? cell
        : best,
    );
  }, null);

  if (!result) {
    Logger.warn(
      `No water cell found within ${MAX_SEARCH_RADIUS} cells of (${siteLat}, ${siteLon})`,
    );
  }

  return result;
}

async function hasRecentWindData(
  siteId: number,
  siteRepository: Repository<Site>,
): Promise<boolean> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - STALE_DATA_DAYS);

  const result = await siteRepository.query(
    `SELECT 1 FROM forecast_data
     WHERE site_id = $1
     AND metric = 'wind_speed'
     AND timestamp > $2
     LIMIT 1`,
    [siteId, cutoff],
  );

  return result.length > 0;
}

async function updateSofarWaveLocation(
  site: Site,
  mask: WaveMask,
  siteRepository: Repository<Site>,
): Promise<{
  id: number;
  longitude: number;
  latitude: number;
  error: string;
} | null> {
  const { polygon, id } = site;
  const [longitude, latitude] = (polygon as Point).coordinates;

  const { row, col } = snapToGrid(latitude, longitude);
  if (mask[row][col] === 1) {
    Logger.log(`Site ${id}: already on water cell — skipping`);
    return null;
  }

  const nearest = getNearestWaterPoint(latitude, longitude, mask);

  if (!nearest) {
    Logger.warn(
      `Could not get nearest point for site id: ${id}, (lon, lat): (${longitude}, ${latitude})`,
    );
    return {
      id,
      longitude,
      latitude,
      error: 'No water point found within search radius',
    };
  }

  const { lat: nearestLat, lon: nearestLon } = nearest;
  const distKm = distanceDeg(latitude, longitude, nearestLat, nearestLon) * 111;
  const nearestPoint = createPoint(nearestLon, nearestLat);

  const windDataPresent = await hasRecentWindData(id, siteRepository);

  await siteRepository.save({
    id,
    nearestSofarWaveLocation: nearestPoint,
    ...(!windDataPresent && { nearestSofarWindLocation: nearestPoint }),
  });

  Logger.log(
    `Updated site ${id} (${longitude}, ${latitude}) -> (${nearestLon}, ${nearestLat}), ${distKm.toFixed(1)}km — wind redirect: ${!windDataPresent}`,
  );
  return null;
}

export async function updateSofarWaveLocations(
  sites: Site[],
  mask: WaveMask,
  siteRepository: Repository<Site>,
): Promise<void> {
  Logger.log(`Updating ${sites.length} sites...`);

  const failedSites = (
    await Promise.all(
      sites.map((site) => updateSofarWaveLocation(site, mask, siteRepository)),
    )
  ).filter((site) => site !== null);

  if (failedSites.length > 0) {
    Logger.warn(`Failed to process ${failedSites.length} sites:`);
    failedSites.forEach((site) => {
      if (!site) return;
      Logger.warn(
        `- Site ${site.id}: (${site.longitude}, ${site.latitude}) - ${site.error}`,
      );
    });
  }

  Logger.log('Done updating Sofar wave locations');
}
