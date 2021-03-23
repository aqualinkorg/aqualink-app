FROM node:12

# Install netcdf
RUN apt update
RUN apt install -y sudo
RUN sudo apt install -y libnetcdf-dev

# Run application
ENV NODE_ENV=production
WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN yarn install --production

COPY . .

CMD [ "yarn", "start" ]
