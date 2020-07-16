import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { FirebaseAuthStrategy } from './firebase-auth.strategy';

@Module({
  imports: [PassportModule, UsersModule],
  providers: [FirebaseAuthStrategy],
})
export class AuthModule {}
