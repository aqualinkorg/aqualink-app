import { User } from 'store/User/types';

export const mockUser: User = {
  id: 1,
  adminLevel: 'default',
  administeredSites: [],
  email: 'mail@mail.com',
  firebaseUid: 'RaNdOm StRiNg',
  fullName: 'Mock User',
  organization: 'Some organization',
  token: 'RaNdOm StRiNg',
};

export const mockAdminUser: User = {
  id: 2,
  adminLevel: 'super_admin',
  administeredSites: [],
  email: 'mail2@mail.com',
  firebaseUid: 'OthEr RaNdOm StRiNg',
  fullName: 'Mock Admin',
  organization: 'Admin organization',
  token: 'OtheR RaNdOm StRiNg',
};
