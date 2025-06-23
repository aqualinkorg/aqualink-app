/* eslint-disable fp/no-mutating-methods */
/* eslint-disable fp/no-mutation */
import { createReadStream, existsSync } from 'fs';
import xlsx from 'node-xlsx';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Logger } from '@nestjs/common';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { groupBy, keyBy, uniqWith } from 'lodash';
import csv from 'csv-parser';
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
  all?: boolean;
};

/**
 * The fields we need to extract from the Belt.xlsx file
 */
const beltFields = [
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

async function parseFile<T extends string>(
  filePath: string,
  fields: ReadonlyArray<T>,
): Promise<{
  rows: any[]; // csv-parser produces objects, not string arrays
  getField: (row: any, field: T) => any;
  header: string[];
  sheetRowCount: number;
}> {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Handle CSV files using streaming parser
  if (filePath.toLowerCase().endsWith('.csv')) {
    logger.log(`Parsing CSV file: ${filePath}`);
    return new Promise((resolve, reject) => {
      const rows: any[] = [];
      let header: string[] = [];

      createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headers: string[]) => {
          header = headers;
          // Basic validation: Check if expected fields are present in the header
          const missingFields = fields.filter((f) => !header.includes(f));
          if (missingFields.length > 0) {
            reject(
              new Error(
                `CSV file ${filePath} is missing required headers: ${missingFields.join(
                  ', ',
                )}`,
              ),
            );
          }
        })
        .on('data', (data: any) => rows.push(data))
        .on('end', () => {
          logger.log(`Finished parsing CSV. Found ${rows.length} rows.`);
          // CSV parser provides rows as objects keyed by header names.
          // The getField function simply accesses the property.
          const getField = (row: any, field: T) => row[field];
          resolve({
            rows,
            getField,
            header,
            sheetRowCount: rows.length + 1, // +1 for header row
          });
        })
        .on('error', (error: Error) => {
          logger.error(`Error parsing CSV file ${filePath}`, error);
          reject(error);
        });
    });
  }

  // Handle Excel files using existing logic
  logger.log(`Parsing Excel file: ${filePath}`);
  const workbook = xlsx.parse(filePath, { raw: false });

  // Check if parsing failed (empty workbook) and suggest potential format issue
  if (!workbook || workbook.length === 0) {
    throw new Error(
      `Failed to parse any sheets from '${filePath}'. The file might be too large, corrupt, or in an incompatible format. Please check the file content and format. If it is a very large Excel file, try re-saving it as CSV instead. `,
    );
  }

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

async function uploadSites({ filePath, dryRun, all }: Args) {
  logger.log(`Processing file: ${filePath}, dryRun: ${dryRun}, all: ${all}`);

  // Initialize typeorm connection
  const config = configService.getTypeOrmConfig() as DataSourceOptions;
  const dataSource = new DataSource(config);
  const connection = await dataSource.initialize();

  const { rows, getField } = await parseFile(filePath, siteDescriptionFields);

  const siteRepository = connection.getRepository(Site);
  const reefCheckSiteRepository = connection.getRepository(ReefCheckSite);
  let errors = 0;

  // Fetch existing site IDs if onlyNew mode is enabled
  const existingSiteIds = new Set<string>();
  if (!all) {
    logger.log(
      '--all flag not specified: Fetching existing ReefCheckSite IDs to skip them...',
    );
    const existingSites = await reefCheckSiteRepository.find({
      select: ['id'],
    });
    existingSites.forEach((site) => existingSiteIds.add(site.id));
    logger.log(`Found ${existingSiteIds.size} existing ReefCheckSite IDs.`);
  }

  await uniqWith(
    rows,
    (val, otherVal) =>
      getField(val, 'site_id') === getField(otherVal, 'site_id'),
  ).reduce(async (prevPromise, row) => {
    await prevPromise;
    const siteId = getField(row, 'site_id');

    // Skip if onlyNew mode is enabled and site ID already exists
    if (!all && existingSiteIds.has(siteId)) {
      logger.debug(`Skipping site ID ${siteId} as it already exists.`);
      return; // Skip this row
    }

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

async function uploadSurveys({ filePath, dryRun, all }: Args) {
  logger.log(`Processing file: ${filePath}, dryRun: ${dryRun}, all: ${all}`);

  // Initialize typeorm connection
  const config = configService.getTypeOrmConfig() as DataSourceOptions;
  const dataSource = new DataSource(config);
  const connection = await dataSource.initialize();
  const reefCheckSurveyRepository = connection.getRepository(ReefCheckSurvey);
  const reefCheckSiteRepository = connection.getRepository(ReefCheckSite);

  const { rows, getField } = await parseFile(filePath, siteDescriptionFields);

  logger.log(`Processing ${rows.length} surveys`);

  const reefCheckSites = await reefCheckSiteRepository.find({
    select: ['id', 'siteId'],
  });
  const reefCheckSiteIdToSiteIdMap = new Map<string, number>();
  reefCheckSites.forEach((reefCheckSite) => {
    reefCheckSiteIdToSiteIdMap.set(reefCheckSite.id, reefCheckSite.siteId);
  });
  logger.log(`Total reef check sites loaded: ${reefCheckSites.length}`);

  // Fetch existing survey IDs if onlyNew mode is enabled
  const existingSurveyIds = new Set<string>();
  if (!all) {
    logger.log(
      '--all flag not specified: Fetching existing ReefCheckSurvey IDs to skip them...',
    );
    const existingSurveys = await reefCheckSurveyRepository.find({
      select: ['id'],
    });
    existingSurveys.forEach((survey) => existingSurveyIds.add(survey.id));
    logger.log(`Found ${existingSurveyIds.size} existing ReefCheckSurvey IDs.`);
  }

  const surveys: Omit<ReefCheckSurvey, 'site' | 'reefCheckSite'>[] = rows
    .map((row) => {
      const date = new Date(
        `${getField(row, 'date')} ${
          getField(row, 'time_of_day_work_began') ?? ''
        }`,
      );
      const surveyId = getField(row, 'survey_id');

      // Skip if onlyNew mode is enabled and survey ID already exists
      if (!all && existingSurveyIds.has(surveyId)) {
        logger.debug(`Skipping survey ID ${surveyId} as it already exists.`);
        return null; // Skip this row
      }

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

async function uploadOrganisms({ filePath, all }: Args) {
  logger.log(`Processing file: ${filePath}, all: ${all}`);

  // Initialize typeorm connection
  const config = configService.getTypeOrmConfig() as DataSourceOptions;
  const dataSource = new DataSource(config);
  const connection = await dataSource.initialize();
  const reefCheckOrganismRepository =
    connection.getRepository(ReefCheckOrganism);
  const reefCheckSurveyRepository = connection.getRepository(ReefCheckSurvey);

  const surveys = await reefCheckSurveyRepository.find({ select: ['id'] });
  const surveysMap = keyBy(surveys, 'id');
  const { rows, getField } = await parseFile(filePath, beltFields);

  let filteredRows = rows;

  // If not --all, filter out rows for surveys already present in reef_check_organism
  if (!all) {
    logger.log(
      '--all flag not specified: Fetching existing survey IDs from reef_check_organism to skip them...',
    );
    const existingOrganismSurveys = await reefCheckOrganismRepository
      .createQueryBuilder('organism')
      .select('DISTINCT organism.survey_id', 'surveyId')
      .getRawMany<{ surveyId: string }>();

    const existingSurveyIds = new Set(
      existingOrganismSurveys.map((s) => s.surveyId),
    );

    logger.log(
      `Found ${existingSurveyIds.size} surveys with existing organism data.`,
    );

    filteredRows = rows.filter((row) => {
      const surveyId = getField(row, 'survey_id');
      const shouldSkip = existingSurveyIds.has(surveyId);
      if (shouldSkip) {
        // Optional: Add debug logging for skipped surveys
        // logger.debug(`Skipping organism data for existing survey ID ${surveyId}`);
      }
      return !shouldSkip;
    });

    logger.log(
      `Processing ${filteredRows.length} rows after filtering out existing surveys.`,
    );
  } else {
    logger.log(`Processing all ${rows.length} rows (--all specified).`);
  }

  const parseIntOrZero = (str: string | undefined) => {
    const v = parseInt(str || '0', 10);
    return Number.isNaN(v) ? 0 : v;
  };

  const organisms: Omit<ReefCheckOrganism, 'id' | 'survey'>[] = filteredRows
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

async function uploadSubstrates({ filePath, all }: Args) {
  logger.log(`Processing file: ${filePath}, all: ${all}`);

  // Initialize typeorm connection
  const config = configService.getTypeOrmConfig() as DataSourceOptions;
  const dataSource = new DataSource(config);
  const connection = await dataSource.initialize();
  const reefCheckSubstrateRepository =
    connection.getRepository(ReefCheckSubstrate);
  const reefCheckSurveyRepository = connection.getRepository(ReefCheckSurvey);

  const surveys = await reefCheckSurveyRepository.find({ select: ['id'] });
  const surveysMap = keyBy(surveys, 'id');

  const { rows, getField } = await parseFile(filePath, substratesFields);

  let filteredRows = rows;

  // If not --all, filter out rows for surveys already present in reef_check_substrate
  if (!all) {
    logger.log(
      '--all flag not specified: Fetching existing survey IDs from reef_check_substrate to skip them...',
    );
    const existingSubstrateSurveys = await reefCheckSubstrateRepository
      .createQueryBuilder('substrate')
      .select('DISTINCT substrate.survey_id', 'surveyId')
      .getRawMany<{ surveyId: string }>();

    const existingSurveyIds = new Set(
      existingSubstrateSurveys.map((s) => s.surveyId),
    );

    logger.log(
      `Found ${existingSurveyIds.size} surveys with existing substrate data.`,
    );

    filteredRows = rows.filter((row) => {
      const surveyId = getField(row, 'survey_id');
      const shouldSkip = existingSurveyIds.has(surveyId);
      if (shouldSkip) {
        // Optional: Add debug logging for skipped surveys
        // logger.debug(`Skipping substrate data for existing survey ID ${surveyId}`);
      }
      return !shouldSkip;
    });

    logger.log(
      `Processing ${filteredRows.length} rows after filtering out existing surveys.`,
    );
  } else {
    logger.log(`Processing all ${rows.length} rows (--all specified).`);
  }

  const groupedRows = groupBy(
    filteredRows,
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

  const { rows, getField } = await parseFile(filePath, collectorsFields);

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
    // Use raw query instead of the ORM for performance

    const values = surveys.map((s) => [s.id, s.teamLeader, s.teamScientist]);
    // Construct parameters string: ($1, $2, $3), ($4, $5, $6), ...
    const parameterString = values
      .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
      .join(', ');
    const query = `
      update reef_check_survey as rcs
      set
        team_leader = c.team_leader,
        team_scientist = c.team_scientist
      from (values
        ${parameterString}
      ) as c(id, team_leader, team_scientist) 
      where c.id = rcs.id;
    `;
    const parameters = values.flat();
    const [, updatedCount] = await connection.manager.query(query, parameters);

    logger.log(`Updated ${updatedCount} surveys`);
  } catch (err) {
    logger.error('Error inserting surveys', err);
  }
}

yargs(hideBin(process.argv))
  .command(
    'upload-sites',
    'Upload sites from the "Site Description.xlsx" file',
    {
      filePath: {
        alias: 'f',
        describe: 'Path to the "Site Description.xlsx" file',
        type: 'string',
        demandOption: true,
      },
      dryRun: {
        alias: 'd',
        describe: 'Run the script without saving to the database',
        type: 'boolean',
        default: false,
      },
      all: {
        alias: 'a',
        describe:
          'Process all entries from the file, even if they already exist in the database. Default processes only new entries.',
        type: 'boolean',
        default: false,
      },
    },
    uploadSites,
  )
  .command(
    'upload-surveys',
    'Upload surveys from the "Site Description.xlsx" file',
    {
      filePath: {
        alias: 'f',
        describe: 'Path to the "Site Description.xlsx" file',
        type: 'string',
        demandOption: true,
      },
      dryRun: {
        alias: 'd',
        describe: 'Run the script without saving to the database',
        type: 'boolean',
        default: false,
      },
      all: {
        alias: 'a',
        describe:
          'Process all entries from the file, even if they already exist in the database. Default processes only new entries.',
        type: 'boolean',
        default: false,
      },
    },
    uploadSurveys,
  )
  .command(
    'upload-organisms',
    'Upload organisms from the "Belt.csv" file',
    {
      filePath: {
        alias: 'f',
        describe: 'Path to the "Belt.csv" file',
        type: 'string',
        demandOption: true,
      },
      all: {
        alias: 'a',
        describe:
          'Process all entries from the file, even if they already exist in the database. Default processes only new entries.',
        type: 'boolean',
        default: false,
      },
    },
    uploadOrganisms,
  )
  .command(
    'upload-substrates',
    'Upload substrates from the "Substrate.csv" file',
    {
      filePath: {
        alias: 'f',
        describe: 'Path to the "Substrate.csv" file',
        type: 'string',
        demandOption: true,
      },
      all: {
        alias: 'a',
        describe:
          'Process all entries from the file, even if they already exist in the database. Default processes only new entries.',
        type: 'boolean',
        default: false,
      },
    },
    uploadSubstrates,
  )
  .command(
    'upload-collectors',
    'Upload team leader and team scientist from the "Data Collectors.xlsx" file',
    {
      filePath: {
        alias: 'f',
        describe: 'Path to the "Data Collectors.xlsx" file',
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
