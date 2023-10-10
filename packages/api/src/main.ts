import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as admin from 'firebase-admin';
import { AppModule } from './app.module';
import { GlobalValidationPipe } from './validations/global-validation.pipe';
import { serviceAccount } from '../firebaseConfig';
import { UnauthorizedExceptionFilter } from './exception-filters/unauthorized.filter';
import { HttpExceptionFilter } from './exception-filters/http-exception.filter';
import { apiLoggerMiddleware } from './middleware/api-logger.middleware';
import { configService } from './config/config.service';
import AqualinkDataSource from '../ormconfig';

async function bootstrap() {
  await AqualinkDataSource.initialize();

  if (Object.values(serviceAccount).every((value) => !!value)) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    Logger.warn('Firebase environments not provided', 'MAIN');
  }

  const app = await NestFactory.create(AppModule);

  const { config, documentOptions, customOptions } =
    configService.getSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config, documentOptions);
  SwaggerModule.setup('api/docs', app, document, customOptions);

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new GlobalValidationPipe({ transform: true, skipTransformIds: ['appId'] }),
  );
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new UnauthorizedExceptionFilter(),
  );
  app.use(apiLoggerMiddleware);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(8080);
  // eslint-disable-next-line no-console
  console.log(`App listening on port 8080`);
}
bootstrap();
