// eslint-disable-next-line import/no-extraneous-dependencies
import yargs from 'yargs';
import { Logger } from '@nestjs/common';
import { ConnectionOptions, createConnection, Repository } from 'typeorm';
import { get, groupBy, last, maxBy, minBy } from 'lodash';
import clustersDbscan from '@turf/clusters-dbscan';
import Bluebird from 'bluebird';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { configService } from '../src/config/config.service';
import {
  convertData,
  findOrCreateSourceEntity,
  getFilePathData,
  refreshMaterializedView,
  saveBatchToTimeSeries,
  uploadFileToGCloud,
} from '../src/utils/uploads/upload-sheet-data';
import { SourceType } from '../src/sites/schemas/source-type.enum';
import { Sources } from '../src/sites/sources.entity';
import { Site } from '../src/sites/sites.entity';
import { SiteSurveyPoint } from '../src/site-survey-points/site-survey-points.entity';
import { DataUploads } from '../src/data-uploads/data-uploads.entity';
import { createPoint } from '../src/utils/coordinates';
import { Region } from '../src/regions/regions.entity';
import { getRegion, getTimezones } from '../src/utils/site.utils';
import { TimeSeries } from '../src/time-series/time-series.entity';

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

interface NewData {
  timestamp: string;
  value: number;
  metric: string;
  source: Sources;
}

interface PointInfo {
  cluster: number | undefined;
  name: string;
  site: Site | undefined;
  siteSurveyPoint: SiteSurveyPoint | undefined;
  coordinates: [number, number];
  data: NewData[];
}

const sitesCreated: Site[] = [];
const siteSurveyPointsCreated: SiteSurveyPoint[] = [];

function createSourceAndInsertTimeSeries(
  site: Site,
  points: PointInfo[],
  dataUploadsFile: Awaited<ReturnType<typeof uploadFileToGCloud>> | undefined,
  siteSurveyPointRepository: Repository<SiteSurveyPoint>,
  sourcesRepository: Repository<Sources>,
  timeSeriesRepository: Repository<TimeSeries>,
) {
  return points.map(async (point) => {
    let targetSite: Site;
    let targetSiteSurveyPoint: SiteSurveyPoint | null;

    if (point.site !== undefined) {
      // eslint-disable-next-line fp/no-mutation
      targetSite = point.site;
      // eslint-disable-next-line fp/no-mutation
      targetSiteSurveyPoint = null;
    } else if (point.siteSurveyPoint !== undefined) {
      // eslint-disable-next-line fp/no-mutation
      targetSite = point.siteSurveyPoint.site;
      // eslint-disable-next-line fp/no-mutation
      targetSiteSurveyPoint = point.siteSurveyPoint;
    } else {
      // eslint-disable-next-line fp/no-mutation
      targetSite = site;
      // eslint-disable-next-line fp/no-mutation
      targetSiteSurveyPoint = await siteSurveyPointRepository.save({
        name: point.name,
        polygon: createPoint(point.coordinates[1], point.coordinates[0]),
        site,
      });
      // eslint-disable-next-line fp/no-mutating-methods
      siteSurveyPointsCreated.push(targetSiteSurveyPoint);
    }

    const sourceEntity = await findOrCreateSourceEntity(
      targetSite,
      SourceType.HUI,
      targetSiteSurveyPoint,
      sourcesRepository,
    );
    const dataAsTimeSeries = point.data.map((x) => {
      return {
        timestamp: x.timestamp,
        value: x.value,
        metric: x.metric,
        source: sourceEntity,
        dataUpload: dataUploadsFile,
      };
    });
    return saveBatchToTimeSeries(
      dataAsTimeSeries as QueryDeepPartialEntity<TimeSeries>[],
      timeSeriesRepository,
    );
  });
}

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
  const regionRepository = connection.getRepository(Region);
  const sourcesRepository = connection.getRepository(Sources);
  const timeSeriesRepository = connection.getRepository(TimeSeries);

  logger.log(`Processing data from file: ${filePath}`);

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
        : await siteSurveyPointRepository.findOne({ where: { name: key } });
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
        ) as NewData[],
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

  const clustered = clustersDbscan(
    {
      type: 'FeatureCollection',
      features: sitesAsFeatureCollection,
    },
    2,
    {
      units: 'kilometers',
      minPoints: 1,
    },
  );

  const sitesClustered = sitesWithData.map((x, i) => ({
    ...x,
    cluster: clustered.features[i].properties.cluster,
  }));

  logger.log(`Found ${sitesClustered.length} sites.`);
  const clusterNum = sitesClustered[sitesClustered.length - 1].cluster;
  if (clusterNum) logger.log(`Grouped sites into ${clusterNum + 1} clusters`);

  const allData = sitesClustered.reduce(
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

  const dataUploadsFile = await uploadFileToGCloud(
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
  );

  const groupedClusteredSites = groupBy(sitesClustered, (x) => x.cluster);

  const promises = Object.keys(groupedClusteredSites).map(async (key) => {
    const pointsList = groupedClusteredSites[key];
    const siteIndex = pointsList.findIndex((x) => x.site !== undefined);
    const mainSite = siteIndex !== -1 ? pointsList[siteIndex] : pointsList[0];
    const timezones = getTimezones(
      mainSite.coordinates[0],
      mainSite.coordinates[1],
    ) as string[];
    const region = await getRegion(
      mainSite.coordinates[0],
      mainSite.coordinates[1],
      regionRepository,
    );
    const site = mainSite.site
      ? mainSite.site
      : await siteRepository.save({
          name: mainSite.name,
          region,
          polygon: createPoint(
            mainSite.coordinates[1],
            mainSite.coordinates[0],
          ),
          timezone: timezones[0],
          display: false,
        });

    if (mainSite.site === undefined) {
      // eslint-disable-next-line fp/no-mutating-methods
      sitesCreated.push(site);
      // eslint-disable-next-line fp/no-mutation
      mainSite.site = site;
    }
    await Bluebird.Promise.all(
      createSourceAndInsertTimeSeries(
        site,
        pointsList,
        dataUploadsFile,
        siteSurveyPointRepository,
        sourcesRepository,
        timeSeriesRepository,
      ),
    );
    return key;
  });

  await Bluebird.Promise.each(promises, (clusterId) => {
    logger.log(`Completed cluster ${clusterId}`);
  });

  refreshMaterializedView(dataUploadsRepository);

  logger.warn('The following sites where created:');
  logger.log(
    sitesCreated.map((x) => ({
      id: x.id,
      name: x.name,
    })),
  );
  logger.warn(`The following site's survey points where created:`);
  logger.log(siteSurveyPointsCreated.map((x) => ({ id: x.id, name: x.name })));
}

run();
