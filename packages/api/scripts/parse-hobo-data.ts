import yargs from 'yargs';
import path from 'path';
import fs from 'fs';
import { Logger } from '@nestjs/common';
import parse from 'csv-parse/lib/sync';
import moment from 'moment';
import { ExifParserFactory } from 'ts-exif-parser';
// import axios from 'axios';

const { argv } = yargs
  .scriptName('parse-hobo-data')
  .usage('$0 <cmd> [args]')
  .option('p', {
    alias: 'path',
    describe: 'The path to the HOBO data folder',
    demandOption: true,
    type: 'string',
  })
  .option('r', {
    alias: 'reefs',
    describe: 'The reef id',
    type: 'number',
    demandOption: true,
  })
  .option('a', {
    alias: 'alias',
    describe: 'Override the name of the hobo data folder',
    type: 'string',
  });

interface Coords {
  reef: number;
  colony: number;
  lat: number;
  long: number;
}
const FOLDER_PREFIX = 'Patch_Reef_';
const COLONY_COORDS_FILE = 'Colony_Coords.csv';
const COLONY_FOLDER_PREFIX = 'Col_';
const COLONY_PREFIX = 'Colony ';
const COLONY_DATA_FILE = 'Col{}_FullHOBO.csv';
const validFiles = new Set(['png', 'jpeg', 'jpg']);

// const { BACKEND_URL } = process.env;

async function run() {
  const logger = new Logger('ParseHoboData');
  const { p: rootPath, r: reefId, a: alias } = argv;
  const reefFolder = FOLDER_PREFIX + reefId;

  
}

run();
