import { isManager } from 'helpers/user';
import userServices from 'services/userServices';
import { AdminLevel, User } from './types';
import { CollectionSummary } from '../Collection/types';

export const constructUserObject = async (
  user: User,
  collections: CollectionSummary[],
  token?: string,
): Promise<User> => {
  const { data: administeredSites } =
    await userServices.getAdministeredSites(token);

  return {
    ...user,
    administeredSites: isManager(user) ? administeredSites : [],
    collection: collections?.[0]?.id
      ? { id: collections[0].id, siteIds: collections[0].siteIds }
      : undefined,
    token,
  };
};

const adminLevelOrderVal = (a: AdminLevel | undefined) => {
  switch (a) {
    case 'default':
      return 0;
    case 'site_manager':
      return 1;
    case 'super_admin':
      return 2;
    default:
      return -1;
  }
};

export const compereAdminLevel = (
  a: AdminLevel | undefined,
  b: AdminLevel | undefined,
) => {
  const aVal = adminLevelOrderVal(a);
  const bVal = adminLevelOrderVal(b);

  if (aVal > bVal) return 1;
  if (aVal < bVal) return -1;
  return 0;
};
