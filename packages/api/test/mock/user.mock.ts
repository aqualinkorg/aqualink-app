import { DeepPartial } from 'typeorm';
import { AdminLevel, User } from '../../src/users/users.entity';
import { createPoint } from '../../src/utils/coordinates';

export const adminUserMock: DeepPartial<User> = {
  id: 1,
  firebaseUid: 'abc1234',
  fullName: 'John Doe',
  email: 'johndoe@example.org',
  organization: 'John Foundations',
  location: createPoint(-113.00825255521971, 27.52775820686191),
  country: 'USA',
  adminLevel: AdminLevel.SuperAdmin,
  description: 'A test super admin user',
  imageUrl: 'http://some-sample-url.com',
};

// export const reefManagerUserMock: DeepPartial<User> = {
//   id: 2,
//   firebaseUid: 'abc1234manager',
//   fullName: 'John Manager',
//   email: 'johnmanager@example.org',
//   organization: 'John M Foundations',
//   location: createPoint(-80.92402664087751, 27.605670826465445),
//   country: 'USA',
//   adminLevel: AdminLevel.Default,
//   description: 'A test reef manager user',
//   imageUrl: 'http://some-sample-url.com',
// };

// export const defaultUserMock: DeepPartial<User> = {
//   id: 1,
//   firebaseUid: 'abc1234simple',
//   fullName: 'John Simple',
//   email: 'johnsimple@example.org',
//   organization: 'John S Foundations',
//   location: createPoint(23.934204963785533, 38.134556577054134),
//   country: 'Greece',
//   adminLevel: AdminLevel.Default,
//   description: 'A test default user',
//   imageUrl: 'http://some-sample-url.com',
// };

export const users: DeepPartial<User>[] = [adminUserMock];
