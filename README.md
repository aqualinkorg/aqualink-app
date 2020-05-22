# Aqualink App

This is the main repository for the Aqualink Coral Monitoring Application.

## Description

[Aqualink](https://aqualink.org) is a philanthropically funded system to help people manage their local marine ecosystems in the face of increasing Ocean temperatures. The system consists of satellite-connected underwater temperature sensors and photographic surveys to allow for remote collaboration with scientists across the world. If you are concerned about the effect of climate change on your local reef and want to do something about it then please apply to get a smart buoy for free.

## Development
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
PORT=3000
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

## Contributing

Aqualink is an MIT-licensed open source project. Contributions from developers and scientists are welcome!

## License

  Aqualink is [MIT licensed](LICENSE).
