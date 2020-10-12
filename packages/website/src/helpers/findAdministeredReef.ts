import { User } from "../store/User/types";
import { Reef } from "../store/Reefs/types";

export const findAdministeredReef = (
  user: User | null,
  reefId: number
): Reef | undefined => {
  const reef = user?.administeredReefs?.find((item) => item.id === reefId);

  return reef;
};
