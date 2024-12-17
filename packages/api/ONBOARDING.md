## Glossary

- **Site**: An observation site, usually a site or a group of sites. It is the fundamental unit for the app. All data and other entities are related to one or more sites.
- **Survey Point**: It represents a point of interest in the observation site (site/site). It is used for the surveys and the data to provide a more specific location in the observation site
- **Buoy/Spotter**: A buoy-like device deployed on sites to measure metrics such as temperature (and others in the future)
- **Sensor**: A sensor can be either a spotter or some other sensor-like device used to track metrics.
- **HOBO**: A sensor used for tracking data for an extended period of time (for now only temperature). It has no functionality to remotely send those data. Its data can be downloaded after the end of its mission and ingested by the app as historical data.
- **Sofar**: An online api which provides data for oceans (https://docs.sofarocean.com/)
- **Site-Application**: An form application filled out by any user that wants to register a new site/site in the system. It contains the basic details about the site along with some other form fields used to determine the eligibility for a buoy/spotter.
- **Survey**: A survey event on the site/site, logged by a site admin (i.e. a user of the app). The survey can contain comments, images, videos each of which is related to a specific survey point or the site.

## Technologies Used

### Nest.js

The back-end is written on a framework called **Nest.js**. Nest.js is built on top of Express (or Fastify, but we use Express), but it differs from Express quite a lot.

### Typescript

The whole project is written only in **Typescript** (and we try to keep it that way, meaning that we try to avoid plain Javascript and missing types).

**Note that** if you want to add a new package using yarn, you may need to add packages with type declarations as well, e.g. `@types/multer`.

### Yarn

The project uses **yarn** as its package manager.

**Don't** use `npm`.

### PostgreSQL (with postgis)

The project runs with a **PostgreSQL** database, with the **postgis** extension (for geospatial data) enabled.

**Note that**, for development purposes, the project comes with a `docker-compose.yml` file to run a PostgreSQL instance on a docker container.

### TypeORM

The project uses an ORM, **TypeORM**. Changes on entities (a different name for models) are to be translated into migrations. Migrations should come with proper names and must consist of both `up` and `down` functions.

**Note that** TypeORM is far from perfect. You may encounter issues.

- Be careful to go through automatically generated migrations and fix them, usually they are way more verbose that they should be, so a lot of lines are to be deleted (especially ones that drop/re-create indices). Be careful about which lines to keep and which to delete.
- Joins are a bit tricky. Take a look at existing examples and try to write your code to match them.
- Types are not the best. TypeORM returns the javascript `null` value on `NULL` columns however it does not understand the `null` typescript type. So you will need to add the type by hand (using the `type` option of typeORM) on nullable columns and make sure to use the `| null` type for the type-hint and not the `?` one (see existing entities).

#### Existing issues with the migrations

- In order for typeORM to understand that a view exists it needs to add it to a metadata table. However this caused some issues, so we didn't add it and it keeps trying to create the existing view `latest_data`.
- Also if you need to change the schema of the view or perform changes on its dependent tables (`time_series`, `sources`), drop and recreate it based on the latest migration (`1669109147094-FixTypeorm.ts`).
- In some cases automatically generated migrations may try to drop `IDX_time_series_metric_source_timestamp_DESC`.

### Firebase

The project uses **Firebase** for authenticating users. Requests that should come from authenticated users are to include a **Bearer Token**. To get such a token, the user must first authenticate with Firebase. This is done in the front-end. The back-end uses the `firebase-admin` package to check the validity of such tokens.

### Google Storage

The project uses **Google Storage** for storing files in buckets.

### Cloud Functions

You can access those either through `firebase -> functions` or through `google cloud -> cloud functions`. Their main purpose is to perform periodical updates of the data. Their definitions exist in `cloud-functions/index.ts`, in the root folder of the api package. The package used to create the functions is `firebase-functions`. When creating new file or folders that don't need to be sent to firebase, add them to the `"ignore"` field in `firebase.json`.

#### pingService

- **Description**: A functions that pings the server in order to make sure that the server stays active.
- **Period**: Runs every 5 minutes.
- **Implementation**: Uses endpoint GET /health-check

#### scheduledDailyUpdate

- **Description**: A function that gathers data from the Sofar API and saves them to DailyData table
- **Period**: Runs every day at 4am PST
- **Implementation**: Uses Sofar hindcast-data, sensor-data and wave-data to calculate the following
  - From spotter data:
    - {max, min, avg}BottomTemperature:
    - topTemperature
  - From wave data:
    - {max, min, avg}WaveHeight
    - waveMeanDirection
    - waveMeanPeriod
    - {max, min, avg}WindSpeed
    - windDirection
  - From hindcast data
    - satelliteTemperature
    - degreeHeatingDays
    - {max, min, avg}WaveHeight **\***
    - waveMeanDirection **\***
    - waveMeanPeriod **\***
    - {max, min, avg}WindSpeed **\***
    - windDirection **\***
    - dailyAlert (derived from degreeHeatingDays, satelliteTemperature and site's maxMonthlyMean
    - weeklyAlert (calculated as the maximum dailyAlert of the last 7 days)

**\*** If any wave data is missing it fallbacks to hindcast data

Spotter data are discarded if the date-sensorId exists in ExclusionDates

**Note**: Sofar API has a limited window of data stored so we can backfill only for a certain amount in the past. As a result, we need to check if no data have been fetched to avoid NULL values being added to dailyData.

**Warning**: This script is deprecated and will be discarded in the next steps as the project transitions in fully being dependent of the TimeSeries data format.

#### scheduledSSTTimeSeriesUpdate

- **Description**: A function that fetches SST and degreeHeatingDays from the Sofar API, calculates the sstAnomaly and the alertLevel and saves all of them in the TimeSeries table.
- **Period**: Runs every hour
- **Implementation**: For each day, SST and degreeHeatingDays are fetched from the Sofar API. Then the dailyAlertLevel and the sstAnomaly is calculated based on the data fetched. All four metrics are saved to the TimeSeries table. After that, weeklyAlertLevel is calculated, as the maximum dailyAlertLevel in the last 7 days, and saved to the TimeSeries table as well.

#### scheduledSpotterTimeSeriesUpdate

- **Description**: A function that fetches spotter and wave data from the Sofar API and saves them in TimeSeries
- **Period**: Runs every hour
- **Implementation**: For each day, spotter data are fetched from the Sofar API and saved in the TimeSeries table.

#### scheduledVideoStreamsCheck

- **Description**: A function that checks all sites' video stream and reports any irregularities (stream is not live, stream does not exist etc)
- **Period**: Runs every day at midnight PT
- **Implementation**: Video Streams are currently YouTube streams so a Google API key (Firebase key is used) is needed in order to fetch the details of each video.

#### scheduledBuoysStatusCheck
- **Description**: A function that checks if spotter buoys have received data recently and notifies slack accordingly 
- **Period**: Runs every day at midnight PT
- **Implementation**: Uses the `latest_data` materialized view to check if data from the spotter where received recently 

All errors are reported on the stdout and on the slack bot `Video Stream Alerter`. To report the error on slack a bot api key and a target channel are needed. For more details about message formating in Slack visit https://api.slack.com/reference/surfaces/formatting

Also all functions are reporting any runtime exceptions on Slack using the same bot.

### Scripts & Backfills

All previously mentioned functions (except scheduledVideoStreamsCheck and pingService) can be run locally through the scripts functions with the option to perform a backfill (run update for more than a day in the past):

- scheduledDailyUpdate: (2 options)
  - `yarn daily-worker` (no backfill functionality)
  - `yarn backfill-daily-data -d days-to-backfill [-s siteId1 siteId2 ...]`
- scheduledSSTTimeSeriesUpdate
  - `yarn backfill-sofar-time-series -t sst_backfill -d days-to-backfill [-s siteId1 siteId2 ...]`
- scheduledSpotterTimeSeriesUpdate
  - `yarn backfill-sofar-time-series -t spotter_backfill -d days-to-backfill [-s siteId1 siteId2 ...]`

The rest of the scripts are used to either augment the models with missing data or perform backfills further back in the past than what Sofar is capable of:

- AugmentSite: Augment site with values based on its geographical position (region, MaxMonthlyMean, timezone, HistoricalMonthlyMeans)
  - `yarn augment-sites `
- UploadHoboData: Upload historical data from hobo onsite sensors, through csv files. (process includes creating new sites, survey points, TimeSeries data, sources, surveys and survey media)
  - `yarn upload-hobo-data -p path/to/data-folder -u siteOwnerUser@example.com`
  - Data can be acquired from https://drive.google.com/drive/folders/1IugoTOITkC2ZSmFpXovg8sDO2X2PQnTQ. If you don't have the rights to view the above folder please request it from the client.
- SST backfill: Backfill historical sst values from NOAA repositories
  - (no standard command) `yarn ts-node -r dotenv/config scripts/sst-backfill.ts`
  - Make sure that the `sitesToProcess` array is populated with the desired siteIds to process, before running the script
- Wind-wave data: Update hindcast data in `forecast_data` table
  - `yarn update-wind-wave-date [-s siteId1 siteId2 ...]`
- `fill-noaa-nearest-point` requires optional dependency `netcdf4` to run. You may have trouble installing it with python versions at or above `3.11`. `Python 3.10.6` is tested to build the package successfully.
- `reef-check`: Upload sites, surveys and data from Reef Check. This script is currently run manually when Reef Check sends us new data. Supports 4 commands: `upload-sites`, `upload-surveys`, `upload-organisms` & `upload-substrates`. Upload sites and surveys first. 

### Swagger API docs

Swagger was used to create API docs for all endpoints so that we can make the API publicly available. NestJS has a really nice integration with Swagger allowing it to auto-detect endpoints, parameters and even the types of parameters. This means that the majority of docs are written automatically. However, at some points swagger needs some help and we need to manually add examples, types, etc through decorators.
You can view the current state of the docs on: https://ocean-systems.uc.r.appspot.com/api/docs/ or locally on http://localhost:8080/api/docs/ \
For more details about the NestJS-swagger integration see https://docs.nestjs.com/openapi/introduction

### TimeSeries table

The time series table contains all data used by the app and is the successor of the daily data table. On each row only one value is stored, the type of which is specified by the metric column. This way we can avoid NULL values and backfill each metric separately allowing smaller and cleaner scripts.\
This approach however results in many performance issues since the size of the table is multiplied not only by the time range of data and different targets (sites) but also by the number of different types of data stored. So the following have been done to optimize the performance of the table:

- Create an intermediate table (Source) to reduce FKs and repetition on TimeSeries table. So source_id is the only FK stored.
- Create indices:
  - UNIQUE INDEX (metric, source, timestamp): To avoid duplicates
  - INDEX (metric, source, timestamp DESC): To help with the materialized view `latest_data` **\***
- Create materialized view (`latest_data`) to speed up fetching the latest data for every metric.

For the latest structure of the materialized view `latest_data` please see migration `1623058289647-AddWeeklyAlertMetric.ts`

Query is broken into two parts the inner query uses `distinct on` and `order by` to fetch the latest row based on `timestamp` for each `metric` and `source_id`. The outer query joins the results from the inner query with the source table to have easy access to other tables and also have more source details about the data.\
By breaking the query we can help the optimizer select the correct indices to optimize it.

Since this is a materialized view, we need to reload any time we make any update to the source or time_series table. So at the end of all update scripts a refreshing query is run.\
For example at the end of `utils/spotter-time-series.ts` script we run the following:

```ts
refreshMaterializedView(repository)
```

**\*** TypeORM does not allow complex syntax on indices, so we edited the generated migration (`1622124846208-RefactorTimeSeries.ts`) to include the descending order on timestamps.

### Reef Check feature

Reef Check is an organization dedicated to the conservation of reefs and we integrate their surveys into our app. We have separate tables for their sites and surveys (`reef_check_site` and `reef_check_surveys`) Each Reef Check Site is linked to one Site, we are either creating a new one or linking to an existing one within 100m.  We are also storing information about substrates, fish and diseases in `reef_check_organism` and `reef_check_substrates` related to each survey. Reef Check data is manually send to us in xlsx files and we upload them in database with the `reef-check.ts` script. Run `yarn reef-check --help` or check the script for more information.

### Jest

In order to test our application we have created both `functional` and `e2e` tests. After all tests have run we also calculate our coverage. We aim for green coverage on all api endpoints and and all util functions that are tested. There is no need to try and fully cover all functions in the codebase as many of those rely on third party libraries, which makes it complicated and unnecessary to test.

#### Functional

Functional tests have suffix `.test.ts` and are used to test the util functions, such as `getMMM` or `calculateDegreeHeatingDays`.

#### E2E tests

E2E tests have suffix `.spec.ts` and are used to test the entirety of the api endpoints making sure that all cases are covered.

##### Requirements

- A new database (recommended name `test_aqualink`). Check the [README](./README.md) for instructions to setup the test database.
- Make sure that either the `TEST_POSTGRES_DATABASE` or the `TEST_DATABASE_URL` variable is set (no need to set both).

##### Developing

The `test` folder contains the main components of the e2e tests:

- **app.spec.ts**: It is the starting point of all e2e tests.\
  If a new test is needed add it to the respected `spec.ts` file.\
  If no matching `spec.ts` exists (for example create tests for a new controller), you need to create a new **test suite** following the steps below:
  - First create the new file <controller's name>.spec.ts. Wrap and export all your tests in a functions. It will be used by `app.spec.ts` later
  - Like all other spec files you will need get the active instance of the TestService in the global scope of the tests
  - Using the testService object you can get the active app instance (and active database connection if needed) in the beforeAll function
  - Having an active app instance you can add your e2e tests
  - To run them, add the wrapping function to the `app.spec.ts` file in a `describe` block.
- **jest.json**: Contains the configuration for the execution of the jest command
- **utils.ts**: Contains the mock functions used throughout the tests\
  Creating a mock function in a `es6` environment is a bit tricky. To mock a function declared in a file named `some-utils.ts`, in the `test/utils.ts` do the following:

  - Import the entire module, where the function exists:

  ```ts
  import * as someUtils from '/path/to/some-utils.ts';
  ```

  - Declare a new wrapping function, which will contain the code needed to mock the selected function
  - Use the jest `spyOn` method to select from the imported module the function you will mock
  - Use the `mockImplementation` to override the behavior of the function for the rest of the tests runtime or the `mockImplementationOnce` to override it only once. Make sure that the anonymous function's parameters match the original one's.
  - Execute the wrapping function you created in the 2nd step at the beginning of your test.

  If all the above seemed a bit confusing you can always refer to the code. There are many examples using mocked functions. For example the `mockExtractAndVerifyToken` is used regularly to mock the authorization of the user.

- **mock**: The folder contains mock data to be used to test more thoroughly the app.\
  To add a new mock entry to an existing mock file, create a new object containing the data you want to add. If your entry must contain some other entity (foreign key), add the entity you want to reference to the corresponding relation column.\
  If there is no matching file for the new mock entry follow the steps below:
  - Create a new file in the `mock` in the format <model's name>.mock.ts.
  - Add you new mock data.
  - If you need to reference another entity, add it to the relation column (see other mock entries).
  - Make sure to export all mock data as an array of objects (see other mock files)
  - Import the exported array of the new mock data in the **test.service.ts**. Add a new bulk save command for the corresponding model in the `loadMocks` function. Make sure to respect the relationships and save your data after all its dependencies have been saved first.

**Notes**:

- The above procedure will **not** work for a table that contains a self-reference (parent-child). In order to make this work you will need to save those mock entries separately and respect the relationships in an per-entry level.
- TypeORM will not allow you to add a manual `id` value because the the `id` column is declare as auto-generated. TypeORM will feel the `id` for you after the `save` method has finished. For that reason when you want to use the mock data on your tests make sure to reference them **after** the `app` promise has been resolved.

For more information about jest please refer to the jest documentation: https://jestjs.io/docs/getting-started
