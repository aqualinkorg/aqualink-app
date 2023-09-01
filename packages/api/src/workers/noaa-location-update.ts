import { DataSource, In } from 'typeorm';
import { ScheduledUpdate } from '../sites/scheduled-updates.entity';
import { Site } from '../sites/sites.entity';
import {
  getAvailabilityMapFromFile,
  updateNOAALocation,
} from '../utils/noaa-availability-utils';

export async function NOAALocationUpdate(connection: DataSource) {
  const scheduledUpdateRepository = connection.getRepository(ScheduledUpdate);
  const siteRepository = connection.getRepository(Site);

  const updates = await scheduledUpdateRepository.find({ relations: ['site'] });
  const availability = getAvailabilityMapFromFile();

  await Promise.all([
    updates.map((x) =>
      updateNOAALocation(x.site, availability, siteRepository),
    ),
  ]);

  await scheduledUpdateRepository.delete({ id: In(updates.map((x) => x.id)) });
}
