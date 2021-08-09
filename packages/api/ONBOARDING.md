## Glossary
- **Reef/Site**: An observation site, usually a reef or a group of reefs. It is the fundamental unit for the app. All data and other entities are related to one or more reefs.
- **POI**: Point of interest. It represents a point of interest in the observation site (reef/site). It is used for the surveys and the data to provide a more specific location in the observation site
- **Buoy/Spotter**: A buoy-like device deployed on reefs to measure metrics such as temperature (and others in the future)
- **Sensor**: A sensor can be either a spotter or some other sensor-like device used to track metrics.
- **HOBO**: A sensor used for tracking data for an extended period of time (for now only temperature). It has no functionality to remotely send those data. Its data can be downloaded after the end of its mission and ingested by the app as historical data.
- **Sofar**: An online api which provides data for oceans (https://docs.sofarocean.com/)
- **Reef-Application**: An form application filled out by any user that wants to register a new reef/site in the system. It contains the basic details about the reef along with some other form fields used to determine the eligibility for a buoy/spotter.
- **Survey** A survey event on the reef/site. The survey can contain comments, images, videos each of which is related to a specific POI or the reef/site.

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
- Also if you need to change the schema of the view or perform changes on its dependent tables (`time_series`, `sources`), drop and recreate it based on the latest migration (`1623058289647-AddWeeklyAlertMetric.ts`)

### Firebase
The project uses **Firebase** for authenticating users. Requests that should come from authenticated users are to include a **Bearer Token**. To get such a token, the user must first authenticate with Firebase. This is done in the front-end. The back-end uses the `firebase-admin` package to check the validity of such tokens.

### Google Storage
The project uses **Google Storage** for storing files in buckets. The package used is `multer-google-storage`.

### Cloud Functions
You can access those either through `firebase -> functions` or through `google cloud -> cloud functions`. Their purpose is to perform periodical updates to the data of the database. Their definition exist on `cloud-functions/index.ts` in the root folder of the api package. The package used to create the functions is `firebase-functions`

#### pingService
- **Description**: A functions that pings the server in order to make sure that the server stays active.
- **Period**: Runs every 5 minutes.
- **Implementation**: Uses endpoint GET /health-check

#### scheduledDailyUpdate
- **Description**: A function that gathers data from sofar API and saves them to DailyData table
- **Period**: Runs every day at 4am PST
- **Implementation**: Uses sofar hindcast-data, sensor-data and wave-data to calculate the folowing
  - From spotter data:
    - {max, min, avg}BottomTemperature:
    - topTemperature
  - From wave data:
    - {max, min, avg}WaveHeight
    - waveDirection
    - wavePeriod
    - {max, min, avg}WindSpeed
    - windDirection
  - From hindcast data
    - satelliteTemperature
    - degreeHeatingDays
    - {max, min, avg}WaveHeight **\***
    - waveDirection **\***
    - wavePeriod **\***
    - {max, min, avg}WindSpeed **\***
    - windDirection **\***
    - dailyAlert (derived from degreeHeatingDays, satelliteTemperature and reef's maxMonthlyMean
    - weeklyAlert (calculated as the maximum dailyAlert of the last 7 days)

**\*** If any wave data is missing it fallbacks to hindcast data

Spotter data are discarded if the date-sensorId exists in ExclusionDates

**Note**: Sofar API has a limited window of data stored so we can backfill only for a certain ammount in the past. As a result, we need to check if no data have been fetched to avoid NULL values being added to dailyData.

**Warning**: This script is deprecated and will be discarded in the next steps as the project transitions in fully being dependent of the TimeSeries data format.

#### scheduledSSTTimeSeriesUpdate

- **Description**: A function that fetches SST and degreeHeatingDays from sofarAPI, calculates the sstAnomaly and the alertLevel and saves all of them in the TimeSeries table.
- **Period**: Runs every hour
- **Implementation**: For each day, SST and degreeHeatingDays are fetched from sofarAPI. Then the dailyAlertLevel and the sstAnomaly is calculated based on the data fetched. All four metrics are saved to the TimeSeries table. After that, weeklyAlertLevel is calculated, as the maximum dailyAlertLevel in the last 7 days, and saved to the TimeSeries table as well.

#### scheduledSpotterTimeSeriesUpdate

- **Description**: A function that fetches spotter and wave data from sofarAPI and saves them in TimeSeries
- **Period**: Runs every hour
- **Implementation**: For each day, spotter data are fetched from sofarAPI and saved in the TimeSeries table.

#### scheduledVideoStreamsCheck

- **Description**: A function that checks all reefs' video stream and reports any irregularities (stream is not live, stream does not exist etc)
- **Period**: Runs every day at midnight PST
- **Implementation**: Video Streams are currently YouTube streams so a google api key (Firebase key is used) is needed in order to fetch the details of each video.

  Video Checks based on YouTube API response:
  - Video is not public.
  - Video hasn't been uploaded or processed yet (not available).
  - Video is not embeddable.
  - Video is not a live stream.
  - Video is live stream but it hasn't started yet.
  - Video is live stream but it ended.

  Other checks:
  - Video URL is not in the correct embeddable format
  - Video does not exists

All errors are reported on the stdout and on the slack bot `Video Stream Alerter`. To report the error on slack a bot api key and a target channel are needed. For more details about message formating in slack visit https://api.slack.com/reference/surfaces/formatting

Also all functions are reporting any runtime exceptions on slack using the same bot.

### Scripts
All previously mentioned functions (except scheduledVideoStreamsCheck and pingService) can be run locally through the scripts functions with the option to perform a backfill (run update for more than a day in the past):
- scheduledDailyUpdate: (2 options)
    - `yarn daily-worker` (no backfill functionality)
    - `yarn backfill-daily-data -d days-to-backfill [-r reefId1 reefId2 ...]`
- scheduledSSTTimeSeriesUpdate
    - `yarn backfill-sofar-time-series -t sst_backfill -d days-to-backfill [-r reefId1 reefId2 ...]`
- scheduledSpotterTimeSeriesUpdate
    - `yarn backfill-sofar-time-series -t spotter_backfill -d days-to-backfill [-r reefId1 reefId2 ...]`

The rest of the scripts are used to either augment the models with missing data or perform backfills further back in the past than what sofar is capable of:
- AugemntReef: Augment reef with values based on its geographical position (region, MaxMonthlyMean, timezone, HistoricalMonthlyMeanimums)
    - `yarn augment-reefs `
- UploadHoboData: Upload historical data from hobo onsite sensors, through csv files. (process includes creating new reefs, POIs, TimeSeries data, sources, surveys and survey media)
    - `yarn upload-hobo-data -p path/to/data-folder -u reefOwnerUser@example.com`
    - Data can be acquired from https://drive.google.com/drive/folders/1IugoTOITkC2ZSmFpXovg8sDO2X2PQnTQ. If you don't have the rights to view the above folder please request it from the client.
- SST backfill: Backfill historical sst values from NOAA repositories
    - (no standard command) `yarn ts-node -r dotenv/config scripts/sst-backfill.ts`
    - Make sure that the `reefsToProcess` array is populated with the desired reefIds to process, before running the script

### Swagger API docs
Swagger was used to create API docs for all endpoints so that we can make the API publicly available. NestJS has a really nice integration with Swagger allowing it to auto-detect endpoints, parameters and even the types of paramateters. This means that the majority of docs are written automatically. However, at some points swagger needs some help and we need to manually add examples, types, etc through decorators.
You can view the current state of the docs on: https://ocean-systems.uc.r.appspot.com/api/docs/ or locally on http://localhost:8080/api/docs/ \
For more details about the NestJS-swagger integration see https://docs.nestjs.com/openapi/introduction

### TimeSeries table
THe time series table contains all data used by the app and is the successor of the daily data table. On each row only one value is stored, the type of which is specified by the metric column. This way we can avoid NULL values and backfill each metric seperately allowing smaller and cleaner scripts.\
This approach however results in many performance issues since the size of the table is multiplied not only by the time range of data and different targets (reefs) but also by the number of different types of data stored. So the following have been done to optimize the performance of the table:
- Create an intermidiate table (Source) to reduce FKs and repetition on TimeSeries table. So source_id is the only FK stored.
- Create indices:
    - UNIQUE INDEX (metric, source, timestamp): To avoid duplicates
    - INDEX (metric, source, timestamp DESC): To help with the materialized view `latest_data` **\***
- Create materialized view (`latest_data`) to speed up fetching the latest data for every metric.
```sql
CREATE MATERIALIZED VIEW "latest_data" AS
    SELECT 
        "time_series"."id",
        "time_series"."metric",
        "time_series"."timestamp",
        "time_series"."value",
        "source"."type" AS "source",
        "source"."reef_id" AS "reef_id",
        "source"."poi_id" AS "poi_id"
    FROM 
        (SELECT
            DISTINCT ON ("metric", "source_id") metric AS "metric",
            "id",
            "timestamp",
            "value",
            "source_id"
        FROM "time_series" "time_series"
        ORDER BY "metric", "source_id", "timestamp" DESC) "time_series"
    INNER JOIN "sources" "source" ON "source"."id" = "time_series"."source_id"
```
Query is broken into two parts the inner query uses `distinct on` and `order by` to fetch the latest row based on `timestamp` for each `metric` and `source_id`. The outer query joins the results from the inner query with the source table to have easy access to other tables and also have more source details about the data.\
By breaking the query we can help the optimizer select the correct indices to optimize it.

Since this is a materialized view, we need to reload any time we make any update to the source or time_series table. So at the end of all update scripts a refreshing query is run.

**\*** TypeORM does not allow complex syntax on indices, so we edited the generated migration (`1622124846208-RefactorTimeSeries.ts`) to include the descending order on the timestamp.
