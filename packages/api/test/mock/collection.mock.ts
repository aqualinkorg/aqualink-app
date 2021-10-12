import { DeepPartial } from 'typeorm';
import { Collection } from '../../src/collections/collections.entity';
import { athensSite, californiaSite, floridaSite } from './site.mock';
import { adminUserMock, defaultUserMock } from './user.mock';

export const adminCollectionMock: DeepPartial<Collection> = {
  isPublic: true,
  name: 'Admin Dashboard',
  sites: [floridaSite, californiaSite, athensSite],
  user: adminUserMock,
};

export const defaultCollectionMock: DeepPartial<Collection> = {
  isPublic: false,
  name: 'Default User Dashboard',
  user: defaultUserMock,
};

export const collections = [adminCollectionMock, defaultCollectionMock];
