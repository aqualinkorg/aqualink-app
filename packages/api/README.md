# Aqualink - API

The primary purpose of the API is to serve Aqualink data to the website. In the future, we will also thrive to make the API open and available for developers.

### Installation

```bash
$ yarn install
```

Follow the instructions to install netcdf [here.](https://github.com/parro-it/netcdf4#installation)

Make sure to set your LDFLAGS and CPPFLAGS properly when running the install.
For example, if you installed using homebrew:
```bash
$ CXXFLAGS="--std=c++17" LDFLAGS="-L/opt/homebrew/opt/netcdf/lib" CPPFLAGS="-I/opt/homebrew/opt/netcdf/include" yarn install
```

### Settings

The database connection must be configured before you can run the app. Configuration is sourced from environment
variables. You can either specify a Postgres connection URL using `DATABASE_URL`, or individual options:

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=!ChangeMe!
POSTGRES_HOST=localhost
POSTGRES_PORT=54321
POSTGRES_DATABASE=postgres
```

In production, `APP_SECRET` should be set as well. And the database needs to have the `postgis` extension enabled. `postgis` gets installed as part of the migration. But you can also add it manually by running `CREATE IF NOT EXISTS EXTENSION postgis;`.

In development, we optionally use [dotenv](https://www.npmjs.com/package/dotenv) to automatically load environment
variables from the file `./.env` - you can create these file with the database connection options listed above.

### Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

### Migrations

Migrations happen using the TypeORM CLI.

```bash
# Run a CLI command
$ yarn typeorm

# Create a new migration
$ yarn migration:generate ./migration/NameOfMigration

# Run Migrations
$ yarn migration:run
```

### Test

#### Prerequisite

You need to create a new database for the tests and make sure the name matches the `TEST_POSTGRES_DATABASE` env var. The recommended approach is to manually create a new DB within the same container that api db is running.

```bash
# Run the db container for the api
docker compose up aqua-postgres -d

# Create test_ovio db for tests. Replace any values to match your .env
docker exec -it api-aqua-postgres-1 psql -h localhost -U postgres -W -c "CREATE DATABASE test_aqualink;"

# Run migrations on test db
NODE_ENV=test yarn migration:run
```

#### Run tests

```bash
# Run unit & e2e tests
$ yarn test

# test coverage
$ yarn test:cov
```

### Daily Updates

We run daily updates using Firebase Cloud Functions.

#### Prerequisite

Before running daily updates for the first time, you will need to augment your site table with timezone and maximum monthly mean temperature. To do so, you can simply use the convenience script `yarn augment-sites`.

In addition, you will need to set the environment variables in Firebase:

```
yarn config:cloud-functions:<project>
```

where `<project>` can take one of the three following values:

1. `prod`: production project
2. `staging`: staging project
3. `programize`: programize staging project

#### Deploy

##### API

```
yarn deploy:ENV
```

##### Cloud Functions

```
yarn deploy:cloud-functions
```
