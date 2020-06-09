# Aqualink - API
The primary purpose of the API is to serve Aqualink data to the website. In thre future, we will also thrive to make the API open and avilable for developers.

### Installation

```bash
$ yarn install
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

In production, `APP_SECRET` should be set as well.

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
$ yarn typeorm migration:generate -n NameOfMigration

# Run Migrations
$ yarn typeorm migration:run
```

### Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
