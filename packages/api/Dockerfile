FROM node:20

# Install netcdf
RUN apt update
RUN apt install -y sudo
RUN sudo apt install -y libnetcdf-dev

# Enable Corepack and prepare Yarn v4
RUN corepack enable && corepack prepare yarn@4.9.1 --activate

# Run application
ENV NODE_ENV=production
WORKDIR /app

# TODO - Find a way to get the yarn.lock which is "out of context".
# Because we are in a sub-package it is located at ../../yarn.lock
COPY temp_yarn_workspace_lock ./yarn.lock
COPY ["package.json", "./"]

RUN yarn install --mode=skip-build

# Add yargs and Netcdf to the project so that we can run NOAA available scripts using netcdf in the container.
RUN yarn add yargs
RUN yarn add netcdf4@https://github.com/ovio-forks/netcdf4

COPY . .

CMD [ "yarn", "start" ]
