import { Request } from 'express';
import * as path from 'path';
import { random, times } from 'lodash';
import { validateMimetype } from './mimetypes';

export const getRandomName = (
  folder: string,
  prefix: string,
  file: string,
  type: string | undefined,
) => {
  const extension = path.extname(file);
  const randomString = times(16, () => random(15).toString(16)).join('');
  const fullname = `${prefix}-${type}-${randomString}${extension}`;
  return path.join(folder, fullname);
};

export function assignName(folder: string, prefix: string) {
  return (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void,
  ) => {
    const type = validateMimetype(file.mimetype);
    const relativePath = getRandomName(folder, prefix, file.originalname, type);
    return callback(null, relativePath);
  };
}
