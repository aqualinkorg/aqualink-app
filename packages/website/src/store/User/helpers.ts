import { isManager } from 'helpers/user';
import userServices from 'services/userServices';
import { User } from './types';
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
