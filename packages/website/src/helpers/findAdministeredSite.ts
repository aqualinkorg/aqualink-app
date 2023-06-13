import { User } from 'store/User/types';
import { Site } from 'store/Sites/types';

export const findAdministeredSite = (
  user: User | null,
  siteId: number,
): Site | undefined => {
  return user?.administeredSites?.find((item) => item.id === siteId);
};
