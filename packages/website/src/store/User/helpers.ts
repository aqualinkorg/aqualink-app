import { isManager } from "../../helpers/user";
import userServices from "../../services/userServices";
import { CollectionSummary, User } from "./types";

export const constructUserObject = async (
  user: User,
  collections: CollectionSummary[],
  token?: string
): Promise<User> => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  organization: user.organization,
  adminLevel: user.adminLevel,
  firebaseUid: user.firebaseUid,
  administeredReefs: isManager(user)
    ? (await userServices.getAdministeredReefs(token)).data
    : [],
  collection: collections?.[0]?.id
    ? (await userServices.getCollection(collections[0].id, token)).data
    : undefined,
  token,
});
