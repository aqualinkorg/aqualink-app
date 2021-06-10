import { DeepPartial, ObjectLiteral, ObjectType } from 'typeorm';
import { User } from '../../src/users/users.entity';
import { users } from './user.mock';

const mocks: [
  ObjectType<ObjectLiteral>,
  DeepPartial<ObjectType<ObjectLiteral>>[],
][] = [[User, users]];

export default mocks;
