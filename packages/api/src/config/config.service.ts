import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UpdateSiteApplicationDto } from '../site-applications/dto/update-site-application.dto';
import { UpdateSiteWithApplicationDto } from '../site-applications/dto/update-site-with-application.dto';
import {
  CreateSiteApplicationDto,
  CreateSiteDto,
} from '../sites/dto/create-site.dto';
import { Site } from '../sites/sites.entity';
import { TimeSeriesPoint } from '../time-series/dto/time-series-point.dto';

// dotenv is a dev dependency, so conditionally import it (don't need it in Prod).
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('dotenv').config();
} catch {
  // Pass
}

// ormconfig is a CommonJS/AMD style import rather than ES6-style module due to how TypeORM CLI works internally.
// This means we need to use require rather than import, unfortunately.
const dbConfig = require('../../ormconfig');

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value) {
      if (throwOnMissing) {
        throw new Error(`config error - missing env.${key}`);
      } else {
        return '';
      }
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public isProduction() {
    const mode = this.getValue('NODE_ENV', false);
    return mode !== 'development';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      ...dbConfig,
    };
  }

  public getSwaggerConfig() {
    const config = new DocumentBuilder()
      .setTitle('Aqualink API documentation')
      .setDescription('The Aqualink public API documentation')
      .addBearerAuth()
      .build();

    const documentOptions: SwaggerDocumentOptions = {
      extraModels: [
        UpdateSiteWithApplicationDto,
        UpdateSiteApplicationDto,
        CreateSiteDto,
        CreateSiteApplicationDto,
        Site,
        TimeSeriesPoint,
      ],
    };

    // Disable 'try it out' option as it will only add extra workload to the server
    // Reference: https://github.com/swagger-api/swagger-ui/issues/3725
    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        plugins: {
          statePlugins: {
            spec: { wrapSelectors: { allowTryItOutFor: () => () => false } },
          },
        },
      },
    };

    return { config, documentOptions, customOptions };
  }
}

const configService = new ConfigService(process.env);

export { configService };
