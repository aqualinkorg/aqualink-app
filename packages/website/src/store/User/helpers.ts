import { isManager } from "../../helpers/user";
import userServices from "../../services/userServices";
import { User } from "./types";
import { CollectionSummary } from "../Collection/types";

export const constructUserObject = async (
  user: User,
  collections: CollectionSummary[],
  token?: string
): Promise<User> => {
  const { data: administeredReefs } = await userServices.getAdministeredReefs(
    token
  );

  return {
    ...user,
    administeredReefs: isManager(user) ? administeredReefs : [],
    collection: collections?.[0]?.id
      ? { id: collections[0].id, reefIds: collections[0].reefIds }
      : undefined,
    token,
  };
};
