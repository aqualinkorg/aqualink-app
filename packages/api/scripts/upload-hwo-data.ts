// eslint-disable-next-line import/no-extraneous-dependencies
import yargs from 'yargs';
import { Logger } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { get, groupBy, last, maxBy, minBy } from 'lodash';
import Bluebird from 'bluebird';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { configService } from '../src/config/config.service';
import {
  convertData,
  findOrCreateSourceEntity,
  getFilePathData,
  saveBatchToTimeSeries,
  uploadFileToGCloud,
} from '../src/utils/uploads/upload-sheet-data';
import { SourceType } from '../src/sites/schemas/source-type.enum';
import { Sources } from '../src/sites/sources.entity';
import { Site } from '../src/sites/sites.entity';
import { DataUploads } from '../src/data-uploads/data-uploads.entity';
import { refreshMaterializedView } from '../src/utils/time-series.utils';
import { TimeSeries } from '../src/time-series/time-series.entity';
import { DataUploadsSites } from '../src/data-uploads/data-uploads-sites.entity';

const argv = yargs
  .scriptName('upload-hwo-data')
  .usage('$0 <cmd> [args]')
  .example(
    '$0 -f data/file.csv',
    "This command will import the data contained in 'data/file.csv' to the timeseries table. Each row must include an 'aqualink_site_id' column with the corresponding Aqualink site ID.",
  )
  .option('f', {
    alias: 'path',
    describe: 'The path to the HWO CSV file to upload',
    demandOption: true,
    type: 'string',
  })
  .help()
  .parseSync();

interface NewData {
  timestamp: string;
  value: number;
  metric: string;
  source: Sources;
}

interface SiteData {
  siteId: number;
  site: Site | null;
  data: NewData[];
}

async function run() {
  const logger = new Logger('ParseHWOData');

  const { f: filePath } = argv;

  const config = configService.getTypeOrmConfig() as DataSourceOptions;
  const dataSource = new DataSource(config);
  const connection = await dataSource.initialize();
  const siteRepository = connection.getRepository(Site);
  const dataUploadsRepository = connection.getRepository(DataUploads);
  const dataUploadsSitesRepository = connection.getRepository(DataUploadsSites);
  const sourcesRepository = connection.getRepository(Sources);
  const timeSeriesRepository = connection.getRepository(TimeSeries);

  logger.log(`Processing data from file: ${filePath}`);

  const {
    workSheetData,
    signature,
    headers,
    importedMetrics,
    headerToTokenMap,
  } = await getFilePathData(filePath);

  const siteIdIndex = headerToTokenMap.findIndex(
    (x) => x === 'aqualink_site_id',
  );

  if (siteIdIndex === -1) {
    throw new Error(
      "No 'aqualink_site_id' or 'site_id' column found in the CSV. Please add a column with the Aqualink site ID for each row.",
    );
  }

  const dataRows = workSheetData
    .slice(1)
    .filter((x) => x.length > 0) as any[][];

  const groupedBySiteId = groupBy(dataRows, (x) => x[siteIdIndex]);

  logger.log(
    `Found data for site IDs: ${Object.keys(groupedBySiteId).join(', ')}`,
  );

  const sitesWithData: SiteData[] = await Promise.all(
    Object.keys(groupedBySiteId).map(async (siteIdStr) => {
      const siteId = parseInt(siteIdStr, 10);
      const site = Number.isNaN(siteId)
        ? null
        : await siteRepository.findOne({ where: { id: siteId } });

      if (!site) {
        logger.warn(`Site with ID ${siteIdStr} not found in database.`);
      }

      const data = convertData(
        groupedBySiteId[siteIdStr] as any,
        headers,
        '',
        {} as Sources,
        headerToTokenMap,
        null,
      );

      return { siteId, site, data };
    }),
  );

  const allData = sitesWithData.reduce(
    (acc, curr) => [...acc, ...curr.data],
    [] as NewData[],
  );

  const minDate = get(
    minBy(allData, (item) => new Date(get(item, 'timestamp')).getTime()),
    'timestamp',
  );
  const maxDate = get(
    maxBy(allData, (item) => new Date(get(item, 'timestamp')).getTime()),
    'timestamp',
  );

  const dataUploadsFile = await uploadFileToGCloud(
    dataUploadsRepository,
    signature,
    [SourceType.HWO],
    last(filePath.split('/')) || '',
    filePath,
    minDate,
    maxDate,
    importedMetrics,
  );

  const dataPromises = sitesWithData.map(async ({ siteId, site, data }) => {
    if (!site) {
      logger.warn(`Skipping site ID ${siteId} — not found in database.`);
      return siteId;
    }

    const sourceEntity = await findOrCreateSourceEntity({
      site,
      sourceType: SourceType.HWO,
      surveyPoint: null,
      sourcesRepository,
    });

    const dataAsTimeSeries = data.map((x) => ({
      timestamp: x.timestamp,
      value: x.value,
      metric: x.metric,
      source: sourceEntity,
      dataUpload: dataUploadsFile,
    }));

    await saveBatchToTimeSeries(
      dataAsTimeSeries as QueryDeepPartialEntity<TimeSeries>[],
      timeSeriesRepository,
    );

    await dataUploadsSitesRepository.save({
      dataUpload: dataUploadsFile,
      targetSite: site,
      targetSiteSurveyPoint: null,
    });

    return siteId;
  });

  await Bluebird.Promise.each(dataPromises, (siteId) => {
    logger.log(`Completed site ${siteId}`);
  });

  refreshMaterializedView(dataUploadsRepository);
}

run();
