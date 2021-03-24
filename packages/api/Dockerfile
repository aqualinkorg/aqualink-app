FROM node:12

# Install netcdf
RUN apt update
RUN apt install -y sudo
RUN sudo apt install -y libnetcdf-dev

# Run application
ENV NODE_ENV=production
WORKDIR /app

# TODO - Find a way to get the yarn.lock which is "out of context".
# Because we are in a sub-package ity is at ../../yarn.lock
COPY ["package.json", "./"]

RUN yarn install --production

COPY . .

CMD [ "yarn", "start" ]
