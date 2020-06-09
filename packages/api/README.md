# Aqualink - API
The primary purpose of the API is to serve Aqualink data to the website. In thre future, we will also thrive to make the API open and avilable for developers.

### Installation

```bash
$ yarn
```

### Settings
Make sure you have a .env file with the following values:

```
APP_SECRET=!NotSoSecretChangeMe!
POSTGRES_USER=postgres
POSTGRES_PASSWORD=!ChangeMe!
POSTGRES_HOST=localhost
POSTGRES_PORT=54321
POSTGRES_DATABASE=postgres
MODE=DEV
RUN_MIGRATIONS=true
```

### Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
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