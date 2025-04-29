# Aqualink - Website

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template, but now is migrated to [rsbuild](https://rsbuild.dev/).

- **Styling & UI Library** Use [Material UI](https://material-ui.com/). Note that to use the [styles API](https://material-ui.com/styles/basics/) you can `import @material-ui/core/styles`. We prefer the Hooks styles API.
- **Routing** Uses [React Router](https://reacttraining.com/react-router/web/guides/quick-start).
- **State Management** Uses [Redux](https://redux.js.org/introduction/getting-started) and the [Redux Toolkit](https://redux-toolkit.js.org/api/configureStore) with slices.
- **Testing** Uses [Vitest](https://vitest.dev/)

## Settings

The app must be configured before you can run it. Configuration is sourced from the following environment variables.

### Required

```
REACT_APP_API_BASE_URL="http://localhost:8080/"
```

### Optional

```
# Firebase for authentication and live stream check (enable Youtube Data API).
REACT_APP_FIREBASE_API_KEY=
# SOFAR API for Sea Surface Temperature and Heat Stress map tiles.
REACT_APP_SOFAR_API_TOKEN=
# Featured site to be highlighted on start before users select one.
REACT_APP_FEATURED_SITE_ID=1
```

In development, we optionally use [dotenv](https://www.npmjs.com/package/dotenv) to automatically load environment
variables from the file `./.env` - you can use the provided `.env.example` file as a template.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

### `yarn scan`

Runs the app in development mode and scans the application for performance issues using `react-scan`.

## Server render with Cloudflare worker

We use Cloudflare Worker to server render site's meta in header tags for SEO purposes, but the site is still running as a single-page-application(SPA). This is how it works:

- On first page load, Cloudflare Worker will return all static assets, with meta header injected;
- On user's subsequent navigation, site will behave as regular SPA. 

To test server render, run `yarn start:worker`. You do need to run `yarn build` first to have static assets ready to be used by worker.