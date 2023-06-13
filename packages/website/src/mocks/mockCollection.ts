import { CollectionDetails } from 'store/Collection/types';
import { mockSite } from './mockSite';
import { mockUser } from './mockUser';

export const mockCollection: CollectionDetails = {
  id: 1,
  isPublic: false,
  name: 'Mock Collection',
  user: mockUser,
  sites: [mockSite],
  siteIds: [1],
};
