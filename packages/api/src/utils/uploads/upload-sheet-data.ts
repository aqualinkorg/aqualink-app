/* eslint-disable no-console */
/* eslint-disable no-plusplus */
import {
  chunk,
  first,
  get,
  groupBy,
  isNaN,
  maxBy,
  minBy,
  uniqBy,
} from 'lodash';
import md5Fle from 'md5-file';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import xlsx from 'node-xlsx';
import Bluebird from 'bluebird';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Site } from '../../sites/sites.entity';
import { SiteSurveyPoint } from '../../site-survey-points/site-survey-points.entity';
import { TimeSeries } from '../../time-series/time-series.entity';
import { Sources } from '../../sites/sources.entity';
import { SourceType } from '../../sites/schemas/source-type.enum';
import { DataUploads } from '../../data-uploads/data-uploads.entity';
import { getSite, surveyPointBelongsToSite } from '../site.utils';
import { GoogleCloudService } from '../../google-cloud/google-cloud.service';
import { getBarometricDiff } from '../sofar';
import { refreshMaterializedView } from '../time-series.utils';
import { Metric } from '../../time-series/metrics.enum';
import { AdminLevel, User } from '../../users/users.entity';
import { DataUploadsSites } from '../../data-uploads/data-uploads-sites.entity';
import { GoogleCloudDir } from '../google-cloud.utils';

interface Repositories {
  siteRepository: Repository<Site>;
  surveyPointRepository: Repository<SiteSurveyPoint>;
  timeSeriesRepository: Repository<TimeSeries>;
  sourcesRepository: Repository<Sources>;
  dataUploadsRepository: Repository<DataUploads>;
  dataUploadsSitesRepository: Repository<DataUploadsSites>;
}

const logger = new Logger('ParseSondeData');

const ACCEPTED_FILE_TYPES = [
  {
    extension: 'xlsx',
    mimetype:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  {
    extension: 'csv',
    mimetype: 'text/csv',
  },
  {
    extension: 'xls',
    mimetype: 'application/vnd.ms-excel',
  },
] as const;
const TIMEZONE_REGEX = /[+-]\d{1,2}:?\d{0,2}\b/;
const SECONDS_IN_DAY = 24 * 60 * 60;
const MISSING_LEAP_YEAR_DAY = SECONDS_IN_DAY * 1000;
const MAGIC_NUMBER_OF_DAYS = 25569;

interface Data {
  timestamp: string;
  value: number;
  metric: Metric;
  source: Sources;
}

const nonMetric = [
  'date',
  'time',
  'timestamp',
  'aqualink_site_id',
  'aqualink_survey_point_id',
  'aqualink_sensor_type',
] as const;

type NonMetric = typeof nonMetric[number];

type Token = Metric | NonMetric;

interface Rule {
  token: Token;
  expression: RegExp;
}

const rules: Rule[] = [
  // Non Metrics
  { token: 'date', expression: /^(Date \(MM\/DD\/YYYY\)|Date)$/ },
  { token: 'time', expression: /^(Time \(HH:mm:ss\)|Time)$/ },
  { token: 'timestamp', expression: /^(Date Time|Date_Time)$/ },
  { token: 'aqualink_site_id', expression: /^aqualink_site_id$/ },
  {
    token: 'aqualink_survey_point_id',
    expression: /^aqualink_survey_point_id$/,
  },
  { token: 'aqualink_sensor_type', expression: /^aqualink_sensor_type$/ },
  // Default Metrics
  // should match 'Temp, °C'
  { token: Metric.AIR_TEMPERATURE, expression: /^Temp, .*C$/ },
  // should match 'Temp °C'
  { token: Metric.BOTTOM_TEMPERATURE, expression: /^(Temp .*C|Temp)$/ },
  { token: Metric.WIND_SPEED, expression: /^Wind Speed, m\/s$/ },
  // should match 'Wind Direction, ø'
  { token: Metric.WIND_DIRECTION, expression: /^Wind Direction, .*$/ },
  // Sonde Metrics
  { token: Metric.CHOLOROPHYLL_RFU, expression: /^Chlorophyll RFU$/ },
  {
    token: Metric.CHOLOROPHYLL_CONCENTRATION,
    expression: /^Chlorophyll ug\/L$/,
  },
  // should match 'Cond µS/cm'
  { token: Metric.CONDUCTIVITY, expression: /^Cond .*S\/cm$/ },
  { token: Metric.WATER_DEPTH, expression: /^Depth m$/ },
  { token: Metric.ODO_SATURATION, expression: /^(ODO % sat|DO_sat)$/ },
  { token: Metric.ODO_CONCENTRATION, expression: /^(ODO mg\/L|DO)$/ },
  { token: Metric.SALINITY, expression: /^(Sal psu|Salinity)$/ },
  // should match 'SpCond µS/cm'
  { token: Metric.SPECIFIC_CONDUCTANCE, expression: /^SpCond .*S\/cm$/ },
  { token: Metric.TDS, expression: /^TDS mg\/L$/ },
  { token: Metric.TURBIDITY, expression: /^(Turbidity FNU|Turbidity)$/ },
  { token: Metric.TOTAL_SUSPENDED_SOLIDS, expression: /^TSS mg\/L$/ },
  { token: Metric.SONDE_WIPER_POSITION, expression: /^Wiper Position volt$/ },
  { token: Metric.PH, expression: /^pH$/ },
  { token: Metric.PH_MV, expression: /^pH mV$/ },
  { token: Metric.SONDE_BATTERY_VOLTAGE, expression: /^Battery V$/ },
  { token: Metric.SONDE_CABLE_POWER_VOLTAGE, expression: /^Cable Pwr V$/ },
  { token: Metric.PRESSURE, expression: /^Pressure, mbar$/ },
  { token: Metric.PRECIPITATION, expression: /^Rain, mm$/ },
  { token: Metric.RH, expression: /^RH, %$/ },
  { token: Metric.WIND_GUST_SPEED, expression: /^Gust Speed, m\/s$/ },
  // HUI Metrics
  { token: Metric.NITROGEN_TOTAL, expression: /^TotalN$/ },
  { token: Metric.PHOSPHORUS_TOTAL, expression: /^TotalP$/ },
  { token: Metric.PHOSPHORUS, expression: /^Phosphate$/ },
  { token: Metric.SILICATE, expression: /^Silicate$/ },
  { token: Metric.NNN, expression: /^NNN$/ },
  { token: Metric.AMMONIUM, expression: /^NH4$/ },
];

export type Mimetype = typeof ACCEPTED_FILE_TYPES[number]['mimetype'];

export const fileFilter: MulterOptions['fileFilter'] = (_, file, callback) => {
  if (
    !ACCEPTED_FILE_TYPES.map(({ mimetype }) => mimetype as string).includes(
      file.mimetype,
    )
  ) {
    callback(
      new BadRequestException(
        `Only ${ACCEPTED_FILE_TYPES.map(
          ({ extension }) => `.${extension}`,
        ).join(', ')} files are accepted`,
      ),
      false,
    );
  }
  callback(null, true);
};

const getJsDateFromExcel = (excelDate, timezone) => {
  const delta = excelDate - MAGIC_NUMBER_OF_DAYS;
  const parsed = delta * MISSING_LEAP_YEAR_DAY;

  if (timezone) {
    return new Date(`${parsed} GMT ${timezone}`);
  }

  return new Date(parsed);
};

const getTimeStamp = (
  index: number | number[],
  item: any[],
  mimetype?: Mimetype,
  timezone?: string,
) => {
  const isArray = Array.isArray(index);
  if (
    isArray &&
    typeof item[index[0]] === 'string' &&
    typeof item[index[1]] === 'string'
  )
    return new Date(`${item[index[0]]} ${item[index[1]]}`);
  if (isArray) {
    const date = new Date(Date.UTC(1900, 0));
    // We get the date as days from 1900. We have to subtract 1 to exactly match the date
    date.setDate(item[index[0]] - 1 || 0);
    // in some cases 1:30:00 will be interpreted as 25:30:00. In this representation of time seconds are
    // a number from 0 to 1, so we want to keep only the first 24 hours to avoid such errors (therefore the % 1)
    date.setSeconds(Math.round(SECONDS_IN_DAY * (item[index[1]] % 1 || 0)));
    return date;
  }
  if (!isArray && mimetype === 'text/csv' && timezone)
    return new Date(`${item[index]} GMT ${timezone}`);
  if (!isArray && mimetype === 'text/csv' && !timezone)
    return new Date(item[index]);
  return getJsDateFromExcel(item[index], timezone);
};

const findTimeStampIndex = (
  headerToTokenMap: (Token | undefined)[],
): number | number[] => {
  const timestampIndex = headerToTokenMap.findIndex((x) => x === 'timestamp');

  if (timestampIndex !== -1) return timestampIndex;

  const timeIndex = headerToTokenMap.findIndex((x) => x === 'time');
  const dateIndex = headerToTokenMap.findIndex((x) => x === 'date');

  if (timeIndex === -1 || dateIndex === -1) {
    throw new BadRequestException('Not current timestamp schema');
  }
  return [dateIndex, timeIndex];
};

export const getFilePathData = async (filePath: string) => {
  const workSheetsFromFile = xlsx.parse(filePath, { raw: true });
  const workSheetData = workSheetsFromFile[0]?.data;

  const headerIndex = workSheetData?.findIndex((row) =>
    rules.some((rule) =>
      row.some(
        (cell) => typeof cell === 'string' && rule.expression.test(cell),
      ),
    ),
  );

  const headers = workSheetData[headerIndex] as string[];
  const headerToTokenMap: (Token | undefined)[] = headers.map(
    (x) => rules.find((rule) => rule.expression.test(x))?.token,
  );
  const importedMetrics = headerToTokenMap.filter(
    (x): x is Metric => x !== undefined && !nonMetric.includes(x as NonMetric),
  );
  const ignoredHeaders = headers.filter(
    (x, i) => headerToTokenMap[i] === undefined,
  );
  const signature = await md5Fle(filePath);

  return {
    workSheetData,
    signature,
    ignoredHeaders,
    importedMetrics,
    headers,
    headerIndex,
    headerToTokenMap,
  };
};

export const trimWorkSheetData = (
  workSheetData: any[][],
  headers: string[],
  headerIndex: number,
) =>
  (workSheetData ?? [])
    .slice(headerIndex + 1)
    .map((item) => {
      if (item.length === headers.length) return item as string[];
      return undefined;
    })
    .filter((item): item is string[] => item !== undefined);

const groupBySitePointAndType = (
  trimmedWorkSheetData: string[][],
  headerToTokenMap: (Token | undefined)[],
): { [key: string]: string[][] } => {
  const siteIdIndex = headerToTokenMap.findIndex(
    (x) => x === 'aqualink_site_id',
  );
  const surveyPointIdIndex = headerToTokenMap.findIndex(
    (x) => x === 'aqualink_survey_point_id',
  );
  const sourceTypeIndex = headerToTokenMap.findIndex(
    (x) => x === 'aqualink_sensor_type',
  );

  const groupedByMap = new Map<string, string[][]>();

  trimmedWorkSheetData.forEach((val) => {
    const siteId = val[siteIdIndex] || '';
    const surveyPointId = val[surveyPointIdIndex] || '';
    const sourceType = val[sourceTypeIndex] || '';

    const key = `${siteId}_${surveyPointId}_${sourceType}`;
    const item = groupedByMap.get(key);
    if (item !== undefined) {
      groupedByMap.set(key, [...item, val]);
    } else {
      groupedByMap.set(key, [val]);
    }
  });

  return Object.fromEntries(Array.from(groupedByMap));
};

export const convertData = (
  workSheetData: string[][],
  headers: string[],
  headerIndex: number,
  fileName: string,
  sourceEntity: Sources,
  headerToTokenMap: (Token | undefined)[],
  mimetype?: Mimetype,
) => {
  const timestampIndex = findTimeStampIndex(headerToTokenMap);

  console.time(`Get data from sheet ${fileName}`);
  const results = workSheetData.reduce<Data[]>((acc, row) => {
    const timezone =
      typeof timestampIndex === 'number'
        ? first(headers[timestampIndex].match(TIMEZONE_REGEX))
        : undefined;

    const timestamp = getTimeStamp(
      timestampIndex,
      row,
      mimetype,
      timezone,
    ).toISOString();

    const rowValues = row.map<Data | undefined>((cell, i) => {
      const metric = headerToTokenMap[i];
      if (metric === undefined || nonMetric.includes(metric as NonMetric)) {
        return undefined;
      }

      return {
        timestamp,
        value: parseFloat(cell),
        metric: metric as Metric,
        source: sourceEntity,
      };
    });

    const filtered = rowValues.filter((x): x is Data => x !== undefined);
    return [...acc, ...filtered];
  }, []);
  console.timeEnd(`Get data from sheet ${fileName}`);

  console.time(`Remove duplicates and empty values ${fileName}`);
  const data = uniqBy(
    results.filter((valueObject) => {
      if (!isNaN(valueObject.value)) {
        return true;
      }
      logger.log('Excluding incompatible value:');
      logger.log(valueObject);
      return false;
    }),
    ({ timestamp, metric, source }) => `${timestamp}, ${metric}, ${source.id}`,
  );
  console.timeEnd(`Remove duplicates and empty values ${fileName}`);

  return data;
};

export const uploadFileToGCloud = async (
  dataUploadsRepository: Repository<DataUploads>,
  signature: string,
  sources: SourceType[],
  fileName: string,
  filePath: string,
  minDate: string | undefined,
  maxDate: string | undefined,
  importedHeaders: Metric[],
) => {
  logger.warn(`Uploading file to google cloud: ${fileName}`);
  const uploadExists = await dataUploadsRepository.findOne({
    where: {
      signature,
    },
  });

  if (uploadExists) {
    Logger.warn(
      `${fileName}: A file upload named '${uploadExists.file}' with the same data already exists`,
    );
    return uploadExists;
  }
  // Initialize google cloud service, to be used for media upload
  const googleCloudService = new GoogleCloudService();

  // Note this may fail. It would still return a location, but the file may not have been uploaded
  const fileLocation = googleCloudService.uploadFileAsync(
    filePath,
    sources.length === 1 ? sources[0] : 'multi_source',
    GoogleCloudDir.DATA_UPLOADS,
    'data_upload',
  );

  const dataUploadsFile = await dataUploadsRepository.save({
    file: fileName,
    signature,
    sensorTypes: sources,
    minDate,
    maxDate,
    metrics: importedHeaders,
    fileLocation,
  });

  return dataUploadsFile;
};

export const findOrCreateSourceEntity = async (
  site: Site,
  sourceType: SourceType,
  surveyPoint: SiteSurveyPoint | null,
  sourcesRepository: Repository<Sources>,
) => {
  const existingSourceEntity = await sourcesRepository.findOne({
    relations: ['surveyPoint', 'site'],
    where: {
      site: { id: site.id },
      surveyPoint: { id: surveyPoint?.id },
      type: sourceType,
    },
  });
  const sourceEntity =
    existingSourceEntity ||
    (await sourcesRepository.save({
      type: sourceType,
      site,
      surveyPoint,
    }));
  return sourceEntity;
};

export const saveBatchToTimeSeries = (
  data: QueryDeepPartialEntity<TimeSeries>[],
  timeSeriesRepository: Repository<TimeSeries>,
  batchSize = 100,
) => {
  logger.log(`Saving time series data in batches of ${batchSize}`);
  const inserts = chunk(data, batchSize).map(async (batch: any[]) => {
    try {
      await timeSeriesRepository
        .createQueryBuilder('time_series')
        .insert()
        .values(batch)
        // If there's a conflict, replace data with the new value.
        // onConflict is deprecated, but updating it is tricky.
        // See https://github.com/typeorm/typeorm/issues/8731?fbclid=IwAR2Obg9eObtGNRXaFrtKvkvvVSWfvjtHpFu-VEM47yg89SZcPpxEcZOmcLw
        .onConflict(
          'ON CONSTRAINT "no_duplicate_data" DO UPDATE SET "value" = excluded.value',
        )
        .execute();
    } catch (err) {
      console.warn('The following batch failed to upload:\n', batch);
      console.error(err);
    }
    return true;
  });

  // Return insert promises and print progress updates
  const actionsLength = inserts.length;
  return Bluebird.Promise.each(inserts, (props, idx) => {
    logger.log(`Saved ${idx + 1} out of ${actionsLength} batches`);
  });
};

const createEntitiesAndConvert = async ({
  workSheetData,
  siteId,
  surveyPointId,
  headers,
  headerIndex,
  fileName,
  headerToTokenMap,
  sourceType,
  repositories,
  mimetype,
}: {
  workSheetData: string[][];
  siteId: number;
  surveyPointId?: number;
  headers: string[];
  headerIndex: number;
  fileName: string;
  headerToTokenMap: (Token | undefined)[];
  sourceType: SourceType;
  repositories: Repositories;
  mimetype?: Mimetype;
}) => {
  const [site, surveyPoint] = await Promise.all([
    getSite(siteId, repositories.siteRepository),
    surveyPointId
      ? repositories.surveyPointRepository.findOneBy({
          id: surveyPointId,
        })
      : undefined,
  ]);

  if (surveyPoint) {
    await surveyPointBelongsToSite(
      site.id,
      surveyPoint.id,
      repositories.surveyPointRepository,
    );
  }

  const sourceEntity = await findOrCreateSourceEntity(
    site,
    sourceType,
    surveyPoint || null,
    repositories.sourcesRepository,
  );

  const data = convertData(
    workSheetData,
    headers,
    headerIndex,
    fileName,
    sourceEntity,
    headerToTokenMap,
    mimetype,
  );

  return { data, sourceEntity, site, surveyPoint };
};

const uploadPerSiteAndPoint = async ({
  data,
  site,
  surveyPoint,
  repositories,
  dataUploadsFileEntity,
}: {
  data: Data[];
  site: Site;
  surveyPoint?: SiteSurveyPoint;
  repositories: Repositories;
  dataUploadsFileEntity: DataUploads;
}) => {
  const dataAsTimeSeriesNoDiffs = data.map((x) => {
    return {
      timestamp: x.timestamp,
      value: x.value,
      metric: x.metric,
      source: x.source,
      dataUpload: dataUploadsFileEntity,
    };
  });

  const barometricPressures = dataAsTimeSeriesNoDiffs.filter(
    (x) => x.metric === Metric.BAROMETRIC_PRESSURE_TOP,
  );
  const pressuresBySource = groupBy(barometricPressures, 'source.site.id');

  const barometricDiffs = Object.entries(pressuresBySource).map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([key, pressures]) => {
      // eslint-disable-next-line fp/no-mutating-methods
      const sortedPressures = pressures.sort((a, b) => {
        if (a.timestamp > b.timestamp) return 1;
        if (a.timestamp < b.timestamp) return -1;
        return 0;
      });
      const valueDiff = getBarometricDiff(sortedPressures);
      return valueDiff !== null
        ? {
            timestamp: valueDiff.timestamp,
            value: valueDiff.value,
            metric: Metric.BAROMETRIC_PRESSURE_TOP_DIFF,
            source: sortedPressures[1].source,
            dataUpload: dataUploadsFileEntity,
          }
        : undefined;
    },
  );

  const filteredDiffs = barometricDiffs.filter(
    (
      x,
    ): x is {
      timestamp: string;
      value: number;
      metric: Metric;
      source: Sources;
      dataUpload: DataUploads;
    } => x !== undefined,
  );

  const dataAsTimeSeries = [...dataAsTimeSeriesNoDiffs, ...filteredDiffs];

  // Data is too big to added with one bulk insert so we batch the upload.
  console.time(
    `Loading into DB site: ${site.id}, surveyPoint: ${surveyPoint?.id}`,
  );
  await saveBatchToTimeSeries(
    dataAsTimeSeries as QueryDeepPartialEntity<TimeSeries>[],
    repositories.timeSeriesRepository,
  );
  console.timeEnd(
    `Loading into DB site: ${site.id}, surveyPoint: ${surveyPoint?.id}`,
  );

  try {
    // This will fail on file re upload
    await repositories.dataUploadsSitesRepository.save({
      dataUpload: dataUploadsFileEntity,
      site,
      surveyPoint,
    });
  } catch (error: any) {
    logger.warn(error?.message || error);
  }

  logger.log('loading complete');
};

export const uploadTimeSeriesData = async ({
  user,
  filePath,
  fileName,
  siteId,
  surveyPointId,
  sourceType,
  repositories,
  multiSiteUpload,
  failOnWarning,
  mimetype,
}: {
  user?: Express.User & User;
  filePath: string;
  fileName: string;
  siteId: number | undefined;
  surveyPointId: number | undefined;
  sourceType?: SourceType;
  repositories: Repositories;
  multiSiteUpload: boolean;
  failOnWarning?: boolean;
  mimetype?: Mimetype;
}) => {
  console.time(`Upload data file ${fileName}`);

  if (!multiSiteUpload && !siteId) {
    throw new BadRequestException('SiteId is undefined');
  }

  const {
    workSheetData,
    signature,
    ignoredHeaders,
    importedMetrics,
    headers,
    headerIndex,
    headerToTokenMap,
  } = await getFilePathData(filePath);

  if (failOnWarning && ignoredHeaders.length > 0) {
    throw new BadRequestException(
      `${fileName}: The columns ${ignoredHeaders
        .map((header) => header.replace(/\r?\n|\r/g, ''))
        .join(', ')} are not configured for import yet and cannot be uploaded.`,
    );
  }

  const siteInfo =
    headerToTokenMap.findIndex(
      (x) => x === 'aqualink_survey_point_id' || x === 'aqualink_site_id',
    ) > -1;
  if (!multiSiteUpload && siteInfo)
    throw new BadRequestException(
      'File can not include aqualink site information, in this type of request',
    );

  if (multiSiteUpload) {
    // user should never be undefined here since this is a protected endpoint
    if (!user) throw new InternalServerErrorException();

    const siteIdIndex = headerToTokenMap.findIndex(
      (x) => x === 'aqualink_site_id',
    );

    if (siteIdIndex < 0)
      throw new BadRequestException(`no 'aqualink_site_id' column specified`);

    const ids = workSheetData
      .map((x) => x[siteIdIndex])
      .filter((x) => !Number.isNaN(Number(x)));
    const uniqueIds = [...new Map(ids.map((x) => [x, x])).keys()];

    const isSiteAdmin =
      uniqueIds.length > 0
        ? await repositories.siteRepository
            .createQueryBuilder('site')
            .innerJoin('site.admins', 'admins', 'admins.id = :userId', {
              userId: user.id,
            })
            .andWhere('site.id IN (:...siteIds)', { siteIds: uniqueIds })
            .getMany()
        : [];

    const isSuperAdmin = user.adminLevel === AdminLevel.SuperAdmin;

    if (isSiteAdmin.length !== uniqueIds.length && !isSuperAdmin) {
      throw new BadRequestException(`Invalid values for 'aqualink_site_id'`);
    }
  }

  const trimmed = trimWorkSheetData(workSheetData, headers, headerIndex);

  const uploadData = multiSiteUpload
    ? Object.entries(groupBySitePointAndType(trimmed, headerToTokenMap)).map(
        ([key, data]) => ({
          data,
          siteId: parseInt(key.split('_')[0], 10),
          surveyPointId: parseInt(key.split('_')[1], 10) || undefined,
          sourceType: (key.split('_')[2] ||
            SourceType.SHEET_DATA) as SourceType,
        }),
      )
    : [
        {
          data: trimmed,
          // at this point siteId should be a number,
          // since we explicitly check that in case multiSiteUpload is false
          siteId: siteId as number,
          surveyPointId:
            surveyPointId !== undefined ? surveyPointId : undefined,
          sourceType: sourceType || SourceType.SHEET_DATA,
        },
      ];

  const converted = await Promise.all(
    uploadData.map((x) => {
      return createEntitiesAndConvert({
        workSheetData: x.data,
        siteId: x.siteId,
        surveyPointId: x.surveyPointId,
        headers,
        headerIndex,
        fileName,
        headerToTokenMap,
        sourceType: x.sourceType,
        repositories,
        mimetype,
      });
    }),
  );

  const allDataCombined = converted.map((x) => x.data).flat();

  const minDate = get(
    minBy(allDataCombined, (item) =>
      new Date(get(item, 'timestamp')).getTime(),
    ),
    'timestamp',
  );
  const maxDate = get(
    maxBy(allDataCombined, (item) =>
      new Date(get(item, 'timestamp')).getTime(),
    ),
    'timestamp',
  );

  const sourceTypes = uploadData.map((x) => x.sourceType);
  const uniqueSourceTypes = [
    ...new Map(sourceTypes.map((x) => [x, x])).values(),
  ];

  const dataUploadsFile = await uploadFileToGCloud(
    repositories.dataUploadsRepository,
    signature,
    uniqueSourceTypes,
    fileName,
    filePath,
    minDate,
    maxDate,
    importedMetrics,
  );

  await Promise.all(
    converted.map((x) => {
      return uploadPerSiteAndPoint({
        data: x.data,
        site: x.site,
        surveyPoint: x.surveyPoint ?? undefined,
        repositories,
        dataUploadsFileEntity: dataUploadsFile,
      });
    }),
  );

  refreshMaterializedView(repositories.dataUploadsRepository);

  console.timeEnd(`Upload data file ${fileName}`);
  return ignoredHeaders;
};
