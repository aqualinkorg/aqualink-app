/* eslint-disable fp/no-mutating-methods */
/* eslint-disable fp/no-mutation */
import xlsx from 'node-xlsx';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Logger } from '@nestjs/common';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { groupBy, keyBy, uniqWith } from 'lodash';
import fs from 'fs';
import { ReefCheckSubstrate } from '../src/reef-check-substrates/reef-check-substrates.entity';
import { ReefCheckOrganism } from '../src/reef-check-organisms/reef-check-organisms.entity';
import { ReefCheckSurvey } from '../src/reef-check-surveys/reef-check-surveys.entity';
import { Site } from '../src/sites/sites.entity';
import { ReefCheckSite } from '../src/reef-check-sites/reef-check-sites.entity';
import { configService } from '../src/config/config.service';

const logger = new Logger('reef-check');

type Args = {
  filePath: string;
  dryRun?: boolean;
};

/**
 * The fields we need to extract from the Belt.xlsx file
 */
const beltFields = [
  'site_id',
  'survey_id',
  'date',
  'depth (m)',
  'organism_code',
  'type',
  's1 (0-20m)',
  's2 (25-45m)',
  's3 (50-70m)',
  's4 (75-95m)',
  'fish_recorded_by',
  'inverts_recorded_by',
  'errors',
  'what_errors',
] as const;

/**
 * The fields we need to extract from the Site_Description.xlsx file
 */
const siteDescriptionFields = [
  'site_id',
  'survey_id',
  'reef_name',
  'orientation_of_transect',
  'coordinates_in_decimal_degree_format',
  'country',
  'state_province_island',
  'city_town',
  'region',
  'distance_from_shore (m)',
  'distance_from_nearest_river (km)',
  'distance_to_nearest_popn (km)',
  'errors',
  'what_errors',
  'year',
  'date',
  'depth (m)',
  'time_of_day_work_began',
  'time_of_day_work_ended',
  'method_used_to_determine_location (archived field)',
  'river_mouth_width',
  'weather',
  'air_temp (C)',
  'water_temp_at_surface (C)',
  'water_temp_at_3_m (C)',
  'water_temp_at_10_m (C)',
  'approx_popn_size_x_1000',
  'horizontal_visibility_in_water (m)',
  'best_reef_area',
  'why_was_this_site_selected',
  'sheltered_or_exposed',
  'any_major_storms_in_last_years',
  'when_storms',
  'overall_anthro_impact',
  'what_kind_of_impacts (archived field)',
  'siltation',
  'dynamite_fishing',
  'poison_fishing',
  'aquarium_fish_collection',
  'harvest_of_inverts_for_food',
  'harvest_of_inverts_for_curio',
  'tourist_diving_snorkeling',
  'sewage_pollution',
  'industrial_pollution',
  'commercial_fishing',
  'live_food_fishing',
  'artisinal_recreational',
  'other_forms_of_fishing (archived field)',
  'other_fishing (archived field)',
  'yachts',
  'level_of_other_impacts (archived field)',
  'other_impacts',
  'is_site_protected',
  'is_protection_enforced',
  'level_of_poaching',
  'spearfishing',
  'banned_commercial_fishing',
  'recreational_fishing',
  'invertebrate_shell_collection',
  'anchoring',
  'diving',
  'other_specify',
  'nature_of_protection (archived field)',
  'site_comments',
  'substrate_comments',
  'fish_comments',
  'inverts_comments',
  'comments_from_organism_sheet (archived field)',
  'grouper_size (archived field)',
  'percent_bleaching (archived field)',
  'percent_colonies_bleached (archived field)',
  'percent_of_each_colony (archived field)',
  'suspected_disease (archived field)',
  'rare_animals_details',
  'submitted_by (archived field)',
] as const;

/**
 * The fields we need to extract from the Substrate.xlsx file
 */
const substratesFields = [
  'survey_id',
  'date',
  'substrate_code',
  'segment_code',
  'total',
  'substrate_recorded_by',
  'what_errors',
] as const;

/**
 * The fields we need to extract from the Data_Collectors.xlsx file
 */
const collectorsFields = [
  'survey_id',
  'team_leader',
  'team_scientist',
] as const;

function parseFile<T extends string>(filePath: string, fields: T[]) {
  const workbook = xlsx.parse(filePath, { raw: false });
  const sheet = workbook[0].data as string[][];

  if (sheet.length === 0) {
    throw new Error('Empty file or failed to load file');
  }
  const header = sheet[0];
  const fieldIndicesMap = fields.reduce((acc, field) => {
    acc[field] = header.indexOf(field);
    if (acc[field] === -1) {
      throw new Error(`Field not found: ${field}`);
    }
    return acc;
  }, {} as Record<T, number>);

  const getField = (row: string[], field: T) => row[fieldIndicesMap[field]];

  return {
    rows: sheet.slice(1),
    getField,
    header,
    sheetRowCount: sheet.length,
  };
}

async function uploadSites({ filePath, dryRun }: Args) {
  logger.log(`Processing file: ${filePath}, dryRun: ${dryRun}`);

  // Initialize typeorm connection
  const config = configService.getTypeOrmConfig() as DataSourceOptions;
  const dataSource = new DataSource(config);
  const connection = await dataSource.initialize();

  const { rows, getField } = parseFile(filePath, [...siteDescriptionFields]);

  const siteRepository = connection.getRepository(Site);
  const reefCheckSiteRepository = connection.getRepository(ReefCheckSite);
  let errors = 0;

  await uniqWith(
    rows,
    (val, otherVal) =>
      getField(val, 'site_id') === getField(otherVal, 'site_id'),
  ).reduce(async (prevPromise, row) => {
    await prevPromise;
    const siteId = getField(row, 'site_id');
    const siteName = getField(row, 'reef_name');
    const rawCoordinates = getField(
      row,
      'coordinates_in_decimal_degree_format',
    );
    logger.debug(`Processing row: ${siteId}, ${siteName}, ${rawCoordinates}`);

    const [latitude, longitude] = rawCoordinates.split(',').map(parseFloat);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      logger.error(
        `Invalid coordinates: ${latitude}, ${longitude}, for site ${siteName}, ${siteId}`,
      );
      return;
    }
    try {
      // Check if there is a site within 100m and attach the reef check site to it
      // Otherwise create a new site
      const closeSiteWithin100m = await siteRepository
        .createQueryBuilder('site')
        .where(
          `ST_DistanceSphere(ST_GeomFromText('POINT(${longitude} ${latitude})', 4326), site.polygon) <= 100`,
        )
        .getOne();

      if (dryRun) {
        logger.log(
          `Dry run: ${
            closeSiteWithin100m ? 'Update' : 'Create'
          } site: ${siteName} (${
            closeSiteWithin100m?.id
          }), ${latitude}, ${longitude}`,
        );
      } else {
        // Create new site
        const newReefCheckSite = new ReefCheckSite();

        if (closeSiteWithin100m) {
          newReefCheckSite.siteId = closeSiteWithin100m.id;
        } else {
          const newSite = new Site();
          newSite.name = siteName;
          newSite.polygon = {
            type: 'Point',
            coordinates: [longitude, latitude],
          };
          newReefCheckSite.siteId = (await siteRepository.save(newSite)).id;
        }

        newReefCheckSite.id = siteId;
        newReefCheckSite.reefName = getField(row, 'reef_name');
        newReefCheckSite.orientation = getField(row, 'orientation_of_transect');
        newReefCheckSite.country = getField(row, 'country');
        newReefCheckSite.stateProvinceIsland = getField(
          row,
          'state_province_island',
        );
        newReefCheckSite.cityTown = getField(row, 'city_town');
        newReefCheckSite.region = getField(row, 'region');
        newReefCheckSite.distanceFromShore = parseFloat(
          getField(row, 'distance_from_shore (m)'),
        );
        newReefCheckSite.distanceFromNearestRiver = parseFloat(
          getField(row, 'distance_from_nearest_river (km)'),
        );
        newReefCheckSite.distanceToNearestPopn = parseFloat(
          getField(row, 'distance_to_nearest_popn (km)'),
        );
        await reefCheckSiteRepository.save(newReefCheckSite);
      }
    } catch (err) {
      logger.error(
        `Error processing row: ${siteId}, ${siteName}, ${rawCoordinates}`,
        err,
      );
      errors += 1;
    }
  }, Promise.resolve());

  logger.log(`Completed with ${errors} errors.`);
  await connection.destroy();
}

async function uploadSurveys({ filePath, dryRun }: Args) {
  logger.log(`Processing file: ${filePath}, dryRun: ${dryRun}`);

  // Initialize typeorm connection
  const config = configService.getTypeOrmConfig() as DataSourceOptions;
  const dataSource = new DataSource(config);
  const connection = await dataSource.initialize();
  const reefCheckSurveyRepository = connection.getRepository(ReefCheckSurvey);
  const reefCheckSiteRepository = connection.getRepository(ReefCheckSite);

  const { rows, getField } = parseFile(filePath, [...siteDescriptionFields]);

  logger.log(`Processing ${rows.length} surveys`);

  const reefCheckSites = await reefCheckSiteRepository.find({
    select: ['id', 'siteId'],
  });
  const reefCheckSiteIdToSiteIdMap = new Map<string, number>();
  reefCheckSites.forEach((reefCheckSite) => {
    reefCheckSiteIdToSiteIdMap.set(reefCheckSite.id, reefCheckSite.siteId);
  });
  logger.log(`Total reef check sites loaded: ${reefCheckSites.length}`);

  const surveys: Omit<ReefCheckSurvey, 'site' | 'reefCheckSite'>[] = rows
    .map((row) => {
      const date = new Date(
        `${getField(row, 'date')} ${
          getField(row, 'time_of_day_work_began') ?? ''
        }`,
      );
      const siteId = reefCheckSiteIdToSiteIdMap.get(getField(row, 'site_id'));
      // Skip surveys that don't match an existing site in the database
      // Note: Make sure to run the upload-sites command first
      if (Number.isNaN(date.valueOf()) || !siteId) {
        return null;
      }
      return {
        id: getField(row, 'survey_id'),
        siteId,
        reefCheckSiteId: getField(row, 'site_id'),
        errors: getField(row, 'errors'),
        date,
        depth: parseFloat(getField(row, 'depth (m)')),
        timeOfDayWorkBegan: getField(row, 'time_of_day_work_began'),
        timeOfDayWorkEnded: getField(row, 'time_of_day_work_ended'),
        methodUsedToDetermineLocation: getField(
          row,
          'method_used_to_determine_location (archived field)',
        ),
        riverMouthWidth: getField(row, 'river_mouth_width'),
        weather: getField(row, 'weather'),
        airTemp: parseFloat(getField(row, 'air_temp (C)')),
        waterTempAtSurface: parseFloat(
          getField(row, 'water_temp_at_surface (C)'),
        ),
        waterTempAt3M: parseFloat(getField(row, 'water_temp_at_3_m (C)')),
        waterTempAt10M: parseFloat(getField(row, 'water_temp_at_10_m (C)')),
        approxPopnSizeX1000: parseFloat(
          getField(row, 'approx_popn_size_x_1000'),
        ),
        horizontalVisibilityInWater: parseFloat(
          getField(row, 'horizontal_visibility_in_water (m)'),
        ),
        bestReefArea: getField(row, 'best_reef_area'),
        whyWasThisSiteSelected: getField(row, 'why_was_this_site_selected'),
        shelteredOrExposed: getField(row, 'sheltered_or_exposed'),
        anyMajorStormsInLastYears: getField(
          row,
          'any_major_storms_in_last_years',
        ),
        whenStorms: getField(row, 'when_storms'),
        overallAnthroImpact: getField(row, 'overall_anthro_impact'),
        whatKindOfImpacts: getField(
          row,
          'what_kind_of_impacts (archived field)',
        ),
        siltation: getField(row, 'siltation'),
        dynamiteFishing: getField(row, 'dynamite_fishing'),
        poisonFishing: getField(row, 'poison_fishing'),
        aquariumFishCollection: getField(row, 'aquarium_fish_collection'),
        harvestOfInvertsForFood: getField(row, 'harvest_of_inverts_for_food'),
        harvestOfInvertsForCurio: getField(row, 'harvest_of_inverts_for_curio'),
        touristDivingSnorkeling: getField(row, 'tourist_diving_snorkeling'),
        sewagePollution: getField(row, 'sewage_pollution'),
        industrialPollution: getField(row, 'industrial_pollution'),
        commercialFishing: getField(row, 'commercial_fishing'),
        liveFoodFishing: getField(row, 'live_food_fishing'),
        artisinalRecreational: getField(row, 'artisinal_recreational'),
        otherFormsOfFishing: getField(
          row,
          'other_forms_of_fishing (archived field)',
        ),
        otherFishing: getField(row, 'other_fishing (archived field)'),
        yachts: getField(row, 'yachts'),
        levelOfOtherImpacts: getField(
          row,
          'level_of_other_impacts (archived field)',
        ),
        otherImpacts: getField(row, 'other_impacts'),
        isSiteProtected: getField(row, 'is_site_protected'),
        isProtectionEnforced: getField(row, 'is_protection_enforced'),
        levelOfPoaching: getField(row, 'level_of_poaching'),
        spearfishing: getField(row, 'spearfishing'),
        bannedCommercialFishing: getField(row, 'banned_commercial_fishing'),
        recreationalFishing: getField(row, 'recreational_fishing'),
        invertebrateShellCollection: getField(
          row,
          'invertebrate_shell_collection',
        ),
        anchoring: getField(row, 'anchoring'),
        diving: getField(row, 'diving'),
        otherSpecify: getField(row, 'other_specify'),
        natureOfProtection: getField(
          row,
          'nature_of_protection (archived field)',
        ),
        siteComments: getField(row, 'site_comments'),
        substrateComments: getField(row, 'substrate_comments'),
        fishComments: getField(row, 'fish_comments'),
        invertsComments: getField(row, 'inverts_comments'),
        commentsFromOrganismSheet: getField(
          row,
          'comments_from_organism_sheet (archived field)',
        ),
        grouperSize: getField(row, 'grouper_size (archived field)'),
        percentBleaching: getField(row, 'percent_bleaching (archived field)'),
        percentColoniesBleached: getField(
          row,
          'percent_colonies_bleached (archived field)',
        ),
        percentOfEachColony: getField(
          row,
          'percent_of_each_colony (archived field)',
        ),
        suspectedDisease: getField(row, 'suspected_disease (archived field)'),
        rareAnimalsDetails: getField(row, 'rare_animals_details'),
        submittedBy: getField(row, 'submitted_by (archived field)'),
      };
    })
    .filter((survey): survey is ReefCheckSurvey => survey !== null);

  logger.log(`Inserting ${surveys.length} surveys`);
  try {
    const result = await reefCheckSurveyRepository.save(surveys, {
      chunk: 100,
    });

    logger.log(`Inserted ${result.length} surveys`);
  } catch (err) {
    logger.error('Error inserting surveys', err);
  }
}

async function uploadOrganisms({ filePath }: Args) {
  logger.log(`Processing file: ${filePath}`);

  // Initialize typeorm connection
  const config = configService.getTypeOrmConfig() as DataSourceOptions;
  const dataSource = new DataSource(config);
  const connection = await dataSource.initialize();
  const reefCheckOrganismRepository =
    connection.getRepository(ReefCheckOrganism);
  const reefCheckSurveyRepository = connection.getRepository(ReefCheckSurvey);

  const surveys = await reefCheckSurveyRepository.find({ select: ['id'] });
  const surveysMap = keyBy(surveys, 'id');
  const { rows, getField } = parseFile(filePath, [...beltFields]);

  const parseIntOrZero = (str: string | undefined) => {
    const v = parseInt(str || '0', 10);
    return Number.isNaN(v) ? 0 : v;
  };

  logger.log(`Processing ${rows.length} rows`);

  const organisms: Omit<ReefCheckOrganism, 'id' | 'survey'>[] = rows
    .map((row) => ({
      surveyId: getField(row, 'survey_id'),
      date: new Date(getField(row, 'date')),
      organism: getField(row, 'organism_code'),
      type: getField(row, 'type'),
      s1: parseIntOrZero(getField(row, 's1 (0-20m)')),
      s2: parseIntOrZero(getField(row, 's2 (25-45m)')),
      s3: parseIntOrZero(getField(row, 's3 (50-70m)')),
      s4: parseIntOrZero(getField(row, 's4 (75-95m)')),
      recordedBy: getField(row, 'fish_recorded_by'),
      errors: getField(row, 'what_errors'),
    }))
    // Skip rows that don't match an existing survey in the database
    // Note: Make sure to run the upload-surveys command first
    .filter(({ surveyId }) => surveysMap[surveyId]);

  logger.log(`Inserting ${organisms.length} reef check organisms`);
  try {
    const result = await reefCheckOrganismRepository.save(organisms, {
      chunk: 100,
    });

    logger.log(`Inserted ${result.length} organisms`);
  } catch (err) {
    logger.error('Error inserting organisms', err);
  }
}

async function uploadSubstrates({ filePath }: Args) {
  logger.log(`Processing file: ${filePath}`);

  // Initialize typeorm connection
  const config = configService.getTypeOrmConfig() as DataSourceOptions;
  const dataSource = new DataSource(config);
  const connection = await dataSource.initialize();
  const reefCheckSubstrateRepository =
    connection.getRepository(ReefCheckSubstrate);
  const reefCheckSurveyRepository = connection.getRepository(ReefCheckSurvey);

  const surveys = await reefCheckSurveyRepository.find({ select: ['id'] });
  const surveysMap = keyBy(surveys, 'id');

  const { rows, getField } = parseFile(filePath, [...substratesFields]);

  logger.log(`Processing ${rows.length} rows`);

  const groupedRows = groupBy(
    rows,
    (row) => `${getField(row, 'survey_id')}-${getField(row, 'substrate_code')}`,
  );

  const substrates: Omit<ReefCheckSubstrate, 'id' | 'survey'>[] = Object.values(
    groupedRows,
  )
    .map((group) => {
      const row = group[0];
      const metrics = group.reduce(
        (acc, item) => {
          const segment = getField(item, 'segment_code');
          const total = parseInt(getField(item, 'total') || '0', 10);
          if (Number.isNaN(total)) {
            // skip
          } else if (segment === 'S1') {
            acc.s1 = total;
          } else if (segment === 'S2') {
            acc.s2 = total;
          } else if (segment === 'S3') {
            acc.s3 = total;
          } else if (segment === 'S4') {
            acc.s4 = total;
          }
          return acc;
        },
        { s1: 0, s2: 0, s3: 0, s4: 0 },
      );
      return {
        surveyId: getField(row, 'survey_id'),
        date: new Date(getField(row, 'date')),
        substrateCode: getField(row, 'substrate_code'),
        type: getField(row, 'segment_code'),
        ...metrics,
        recordedBy: getField(row, 'substrate_recorded_by'),
        errors: getField(row, 'what_errors'),
      };
    })
    // Skip rows that don't match an existing survey in the database
    // Note: Make sure to run the upload-surveys command first
    .filter(({ surveyId }) => surveysMap[surveyId]);

  logger.log(`Inserting ${substrates.length} reef check substrates`);
  try {
    const result = await reefCheckSubstrateRepository.save(substrates, {
      chunk: 100,
    });

    logger.log(`Inserted ${result.length} substrates`);
  } catch (err) {
    logger.error('Error inserting substrates', err);
  }
}

async function uploadCollectors({ filePath }: Args) {
  logger.log(`Processing file: ${filePath}`);

  // Initialize typeorm connection
  const config = configService.getTypeOrmConfig() as DataSourceOptions;
  const dataSource = new DataSource(config);
  const connection = await dataSource.initialize();
  const reefCheckSurveyRepository = connection.getRepository(ReefCheckSurvey);

  const { rows, getField } = parseFile(filePath, [...collectorsFields]);

  logger.log(`Processing ${rows.length} rows`);

  const surveyMap = keyBy(
    await reefCheckSurveyRepository.find({ select: ['id'] }),
    'id',
  );

  const surveys = rows
    .map((row) => ({
      id: getField(row, 'survey_id'),
      teamLeader: getField(row, 'team_leader'),
      teamScientist: getField(row, 'team_scientist'),
    }))
    .filter(({ id }) => surveyMap[id]);

  logger.log(`Updating ${surveys.length} surveys`);

  try {
    const result = await reefCheckSurveyRepository.save(surveys, {
      chunk: 1000,
    });

    logger.log(`Updated ${result.length} surveys`);
  } catch (err) {
    logger.error('Error inserting surveys', err);
  }
}

yargs(hideBin(process.argv))
  .command(
    'upload-sites',
    'Upload sites from the xlsx file',
    {
      filePath: {
        alias: 'f',
        describe: 'Path to the xlsx file',
        type: 'string',
        demandOption: true,
      },
      dryRun: {
        alias: 'd',
        describe: 'Run the script without saving to the database',
        type: 'boolean',
        default: false,
      },
    },
    uploadSites,
  )
  .command(
    'upload-surveys',
    'Upload surveys from the xlsx file',
    {
      filePath: {
        alias: 'f',
        describe: 'Path to the xlsx file',
        type: 'string',
        demandOption: true,
      },
    },
    uploadSurveys,
  )
  .command(
    'upload-organisms',
    'Upload organisms from the xlsx file',
    {
      filePath: {
        alias: 'f',
        describe: 'Path to the xlsx file',
        type: 'string',
        demandOption: true,
      },
    },
    uploadOrganisms,
  )
  .command(
    'upload-substrates',
    'Upload substrates from the xlsx file',
    {
      filePath: {
        alias: 'f',
        describe: 'Path to the xlsx file',
        type: 'string',
        demandOption: true,
      },
    },
    uploadSubstrates,
  )
  .command(
    'upload-collectors',
    'Upload team leader and team scientist from the Data Collectors xlsx file',
    {
      filePath: {
        alias: 'f',
        describe: 'Path to the xlsx file',
        type: 'string',
        demandOption: true,
      },
    },
    uploadCollectors,
  )
  .scriptName('reef-check')
  .version(false)
  .help()
  .demandCommand()
  .parse();
