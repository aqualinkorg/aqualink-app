FROM node:18

# Install netcdf
RUN apt update
RUN apt install -y sudo
RUN sudo apt install -y libnetcdf-dev

RUN yarn global add typescript
RUN yarn global add ts-node

# Run application
ENV NODE_ENV=production
WORKDIR /app

# TODO - Find a way to get the yarn.lock which is "out of context".
# Because we are in a sub-package it is located at ../../yarn.lock
COPY ["package.json", "yarn.lock", "./"]

RUN yarn install --production

# Add yargs and netdf to the project so that we can run NOAA available scripts using netcdf in the container.
RUN yarn add yargs
RUN yarn add netcdf4

COPY . .

CMD [ "yarn", "start" ]
