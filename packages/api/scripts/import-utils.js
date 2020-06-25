import path from 'path';
import fs from 'fs';
import { pick } from 'lodash';
import nodeSql from 'sql';
import stripBomStream from 'strip-bom-stream';
import csv from 'csv-parser';
import {
  runSqlQuery,
} from './db-utils';

export const surveyFilePath = path.resolve(
  __dirname,
  './application_data/proposed_sites.csv',
);


function assertFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${filePath} NOT found!`);
  }
}

export function verifyImportFilesExist() {
  assertFileExists(surveyFilePath);
}

export function processFile(filePath, onData) {
  return new Promise((resolve) => {
    const promises = [];

    fs.createReadStream(filePath, { encoding: 'utf8' })
      .pipe(stripBomStream())
      .pipe(csv())
      .on('data', (data) => promises.push(onData(data)))
      .on('end', () => Promise.all(promises).then(resolve));
  });
}

const userColumns = [
  'full_name',
  'email',
  'organization',
];

const User = nodeSql.define({
  name: 'user',
  columns: ['id'].concat(userColumns),
});

export function saveUserQuery(user) {
  return User.insert([pick(user, userColumns)])
    .onConflict({})
    .returning(User.id)
    .toQuery();
}

export function getUserQuery(user) {
  return User.select(User.id)
    .from(User)
    .where(
      User.email.equals(user.email)
    )
    .toQuery();
}

export function saveReefQuery(reef) {
  const reefColumns = ['polygon', 'depth'];

  const Reef = nodeSql.define({
    name: 'reef',
    columns: ['id'].concat(reefColumns),
  });

  return Reef.insert([pick(reef, reefColumns)])
    .onConflict({
      index: '(polygon)',
    })
    .returning(Reef.id)
    .toQuery();
}

const ApplicationInfo = nodeSql.define({
  name: 'reef_application',
  columns: ['id', 'uid', 'user_id', 'reef_id'],
});

export async function addApplicationInfo(client, userId, reefId) {
  const insertRows = [{
    user_id: userId,
    reef_id: reefId,
  }];

  const { text, values } = ApplicationInfo
    .insert(insertRows)
    .onConflict({})
    .returning(ApplicationInfo.uid)
    .toQuery();

  const { rows } = await runSqlQuery(text, values, client);
  return rows;
}
