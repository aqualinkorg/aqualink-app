// eslint-disable-next-line import/no-extraneous-dependencies
import yargs from 'yargs';
import { Logger } from '@nestjs/common';
import { ConnectionOptions, createConnection } from 'typeorm';
import { get, groupBy, last, maxBy, minBy } from 'lodash';
import clustersDbscan from '@turf/clusters-dbscan';
import { configService } from '../src/config/config.service';
import {
  convertData,
  getFilePathData,
  uploadFileToGCloud,
} from '../src/utils/uploads/upload-sheet-data';
import { SourceType } from '../src/sites/schemas/source-type.enum';
import { Sources } from '../src/sites/sources.entity';
import { Site } from '../src/sites/sites.entity';
import { SiteSurveyPoint } from '../src/site-survey-points/site-survey-points.entity';
import { DataUploads } from '../src/data-uploads/data-uploads.entity';

const { argv } = yargs
  .scriptName('upload-hui-data')
  .usage('$0 <cmd> [args]')
  .example(
    '$0 -f data/file.xml',
    "This command will import the data contained in 'data/file.xml' to the timeseries table. It will create sites and survey points if needed",
  )
  .option('f', {
    alias: 'path',
    describe: 'The path to the sonde file to upload',
    demandOption: true,
    type: 'string',
  })
  .help();

async function run() {
  // Initialize Nest logger
  const logger = new Logger('ParseHUIData');

  const { f: filePath } = argv;

  // Initialize typeorm connection
  const config = configService.getTypeOrmConfig() as ConnectionOptions;
  const connection = await createConnection(config);
  const siteRepository = connection.getRepository(Site);
  const siteSurveyPointRepository = connection.getRepository(SiteSurveyPoint);
  const dataUploadsRepository = connection.getRepository(DataUploads);
  const sourcesRepository = connection.getRepository(Sources);

  const {
    workSheetData,
    signature,
    ignoredHeaders,
    importedHeaders,
    headers,
    headerIndex,
  } = await getFilePathData(filePath, SourceType.HUI);
  const siteNameIndex = headers.findIndex((x) => x === 'SiteName');
  const groupedBySite = groupBy(
    // Remove first row with the titles
    workSheetData.slice(1),
    (x: any) => x[siteNameIndex],
  );

  const sitesWithData = await Promise.all(
    Object.keys(groupedBySite).map(async (key) => {
      const site = await siteRepository.findOne({ where: { name: key } });
      const siteSurveyPoint = site
        ? undefined
        : siteSurveyPointRepository.findOne({ where: { name: key } });
      return {
        name: key,
        site,
        siteSurveyPoint,
        // [lat, lon]
        coordinates: [groupedBySite[key][0][19], groupedBySite[key][0][20]] as [
          number,
          number,
        ],
        data: convertData(
          groupedBySite[key] as any,
          headers,
          headerIndex,
          SourceType.HUI,
          ignoredHeaders,
          '',
          {} as Sources,
        ),
      };
    }),
  );

  const sitesAsFeatureCollection = sitesWithData.map((x) => ({
    type: 'Feature' as 'Feature',
    geometry: {
      type: 'Point' as 'Point',
      coordinates: x.coordinates,
    },
    properties: {},
  }));

  const clusterd = clustersDbscan(
    {
      type: 'FeatureCollection',
      features: sitesAsFeatureCollection,
    },
    1,
    {
      units: 'kilometers',
      minPoints: 1,
    },
  );

  const sitesClusterd = sitesWithData.map((x, i) => ({
    ...x,
    cluster: clusterd.features[i].properties.cluster,
  }));

  const allData = sitesClusterd.reduce(
    (acc, curr) => {
      return [...acc, ...curr.data];
    },
    [] as {
      timestamp: string;
      value: number;
      metric: string;
      source: Sources;
    }[],
  );

  const minDate = get(
    minBy(allData, (item) => new Date(get(item, 'timestamp')).getTime()),
    'timestamp',
  );
  const maxDate = get(
    maxBy(allData, (item) => new Date(get(item, 'timestamp')).getTime()),
    'timestamp',
  );

  const dataUploadsFile = false
    ? await uploadFileToGCloud(
        dataUploadsRepository,
        signature,
        undefined,
        undefined,
        SourceType.HUI,
        last(filePath.split('/')) || '',
        filePath,
        minDate,
        maxDate,
        importedHeaders,
      )
    : undefined;

  // Do the actual site, site survey point creation and time series upload

  logger.log('Uploading hobo data');
}

run();
