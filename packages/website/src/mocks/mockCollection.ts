import { CollectionDetails } from "../store/Collection/types";
import { mockReef } from "./mockReef";
import { mockUser } from "./mockUser";

export const mockCollection: CollectionDetails = {
  id: 1,
  isPublic: false,
  name: "Mock Collection",
  user: mockUser,
  reefs: [mockReef],
  reefIds: [1],
};
