import { DeepPartial } from 'typeorm';
import { Site, SiteStatus } from '../../src/sites/sites.entity';
import { createPoint } from '../../src/utils/coordinates';

// The repository.save method will amend the following mocks with the other auto-generated columns
// is, createdAt, updatedAt

export const californiaSite: DeepPartial<Site> = {
  name: 'California Site',
  sensorId: 'SPOT-0930',
  polygon: createPoint(-113.79279081056211, 25.085598897064777),
  depth: 43,
  status: SiteStatus.Deployed,
  maxMonthlyMean: 28.54,
  timezone: 'America/Los_Angeles',
  display: true,
  applied: true,
};

export const floridaSite: DeepPartial<Site> = {
  name: 'Florida Site',
  polygon: createPoint(-81.4616546356848, 25.085598897064777),
  depth: 24,
  status: SiteStatus.Approved,
  maxMonthlyMean: 30.54,
  timezone: 'America/Los_Angeles',
  display: true,
  applied: false,
};

export const athensSite: DeepPartial<Site> = {
  name: 'Athens Site',
  polygon: createPoint(37.57941251343841, 23.65678288302115),
  depth: 15,
  sensorId: 'SPOT-300434063450120',
  status: SiteStatus.Shipped,
  maxMonthlyMean: 25.54,
  timezone: 'America/Havana',
  display: true,
  applied: true,
};

export const sites = [californiaSite, floridaSite, athensSite];
