import { User } from "../store/User/types";
import { customCollection } from "../constants/collection";

export const mockUser: User = {
  id: 1,
  adminLevel: "default",
  administeredReefs: [],
  email: "mail@mail.com",
  firebaseUid: "RaNdOm StRiNg",
  fullName: "Mock User",
  organization: "Some organization",
  token: "RaNdOm StRiNg",
  collection: customCollection,
};
