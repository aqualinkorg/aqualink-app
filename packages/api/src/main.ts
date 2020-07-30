import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import * as admin from 'firebase-admin';
import { AppModule } from './app.module';
import { GlobalValidationPipe } from './validations/global-validation.pipe';

try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('dotenv').config();
} catch {
  // Pass
}

async function bootstrap() {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT ||
    '../firebase.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new GlobalValidationPipe({ transform: true, skipTransformIds: ['hashId'] }),
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(8080);
  // eslint-disable-next-line no-console
  console.log(`App listening on port 8080`);
}
bootstrap();
