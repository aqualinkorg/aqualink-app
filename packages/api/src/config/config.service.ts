import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { dataSourceOptions } from '../../ormconfig';
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
  require('dotenv').config();
} catch {
  // Pass
}

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

  API_URL = this.getValue('BACKEND_BASE_URL', true);

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
      ...dataSourceOptions,
    } as TypeOrmModuleOptions;
  }

  public getSwaggerConfig() {
    const config = new DocumentBuilder()
      .setTitle('Aqualink API documentation')
      .setDescription('The Aqualink public API documentation')
      .addServer(this.API_URL)
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
