import { DataSource, In } from 'typeorm';
import { ScheduledUpdate } from '../sites/scheduled-updates.entity';
import { Site } from '../sites/sites.entity';
import {
  getAvailabilityMapFromFile,
  updateNOAALocations,
} from '../utils/noaa-availability-utils';
import {
  getWaveMaskFromFile,
  updateSofarWaveLocations,
} from '../utils/sofar-wave-availability-utils';

export async function NOAALocationUpdate(connection: DataSource) {
  const scheduledUpdateRepository = connection.getRepository(ScheduledUpdate);
  const siteRepository = connection.getRepository(Site);

  const updates = await scheduledUpdateRepository.find({ relations: ['site'] });
  if (updates.length === 0) return;

  const sites = updates.map((x) => x.site);

  const availability = getAvailabilityMapFromFile();
  await updateNOAALocations(sites, availability, siteRepository);

  const waveMask = getWaveMaskFromFile();
  await updateSofarWaveLocations(sites, waveMask, siteRepository);

  await scheduledUpdateRepository.delete({ id: In(updates.map((x) => x.id)) });
}
