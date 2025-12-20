import { User } from 'store/User/types';
import { CollectionDetails } from 'store/Collection/types';

export const isAdmin = (user: User | null, siteId: number): boolean =>
  user
    ? user.adminLevel === 'super_admin' ||
      (user.adminLevel === 'site_manager' &&
        Boolean(user.administeredSites?.find((item) => item.id === siteId)))
    : false;

export const isManager = (user: User | null) =>
  user
    ? user.adminLevel === 'super_admin' || user.adminLevel === 'site_manager'
    : false;

export const isSuperAdmin = (user: User | null) =>
  user ? user.adminLevel === 'super_admin' : false;

export const isCollectionOwner = (
  user: User | null,
  collection: CollectionDetails,
) => user?.id === collection.user?.id;
