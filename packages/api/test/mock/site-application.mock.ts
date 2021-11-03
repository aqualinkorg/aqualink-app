import { DeepPartial } from 'typeorm';
import { SiteApplication } from '../../src/site-applications/site-applications.entity';
import { californiaSite, floridaSite } from './site.mock';
import { siteManagerUserMock } from './user.mock';

export const californiaSiteApplication: DeepPartial<SiteApplication> = {
  permitRequirements: 'Permit Requirements',
  fundingSource: 'Funding source',
  installationResources: 'Installation resources',
  installationSchedule: new Date('2019-01-01'),
  targetShipdate: new Date('2019-03-01'),
  trackingUrl: 'https://www.tracking-service.com/bouy123',
  site: californiaSite,
  user: siteManagerUserMock,
};

export const floridaSiteApplication: DeepPartial<SiteApplication> = {
  site: floridaSite,
  user: siteManagerUserMock,
};

export const siteApplications = [
  californiaSiteApplication,
  floridaSiteApplication,
];
