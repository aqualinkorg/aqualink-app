import { isManager } from 'helpers/user';
import userServices from 'services/userServices';
import { AdminLevel, User } from './types';
import { CollectionSummary } from '../Collection/types';

export const constructUserObject = async (
  user: User,
  collections: CollectionSummary[],
  token?: string,
): Promise<User> => {
  const { data: administeredSites } = await userServices.getAdministeredSites(
    token,
  );

  return {
    ...user,
    administeredSites: isManager(user) ? administeredSites : [],
    collection: collections?.[0]?.id
      ? { id: collections[0].id, siteIds: collections[0].siteIds }
      : undefined,
    token,
  };
};

const adminLevelToInt = (a: AdminLevel | undefined) => {
  if (a === undefined) return -1;
  if (a === 'default') return 0;
  if (a === 'site_manager') return 1;
  return 2;
};

export const compereAdminLevel = (
  a: AdminLevel | undefined,
  b: AdminLevel | undefined,
) => {
  const aVal = adminLevelToInt(a);
  const bVal = adminLevelToInt(b);

  if (aVal > bVal) return 1;
  if (aVal < bVal) return -1;
  return 0;
};
