import { join } from 'path';
// https://github.com/adaltas/node-csv/issues/372
// eslint-disable-next-line import/no-unresolved
import { stringify } from 'csv-stringify/sync';
import {
  closeSync,
  createReadStream,
  openSync,
  unlinkSync,
  writeSync,
} from 'fs';
import type { Response } from 'express';
import { DateTime } from 'luxon';

interface ReturnCSVProps {
  res: Response;
  startDate: Date;
  endDate: Date;
  getRows: (startDate: Date, endDate: Date) => Promise<any>;
  filename: string;
}

export async function ReturnCSV({
  res,
  startDate,
  endDate,
  getRows,
  filename,
}: ReturnCSVProps) {
  const minDate = DateTime.fromJSDate(startDate).startOf('hour');
  const maxDate = DateTime.fromJSDate(endDate).startOf('hour');

  const monthChunkSize = 6;

  const createChunks = (
    curr: DateTime,
    acc: { start: DateTime; end: DateTime }[],
  ): { start: DateTime; end: DateTime }[] => {
    if (curr.diff(minDate, 'months').months < monthChunkSize)
      return [...acc, { end: curr.minus({ milliseconds: 1 }), start: minDate }];

    const next = curr.minus({ months: monthChunkSize });
    const item = { end: curr.minus({ milliseconds: 1 }), start: next };

    return createChunks(next, [...acc, item]);
  };

  const chunks = createChunks(maxDate, []);

  const tempFileName = join(
    process.cwd(),
    Math.random().toString(36).substring(2, 15),
  );

  const fd = openSync(tempFileName, 'w');

  try {
    // eslint-disable-next-line fp/no-mutation, no-plusplus
    for (let i = 0; i < chunks.length; i++) {
      const first = i === 0;

      // we want this not to run in parallel, that's why it is ok here to disable no-await-in-loop
      // eslint-disable-next-line no-await-in-loop
      const rows = await getRows(
        chunks[i].start.toJSDate(),
        chunks[i].end.toJSDate(),
      );

      const csvLines = stringify(rows, { header: first });

      writeSync(fd, csvLines);
    }

    closeSync(fd);

    const readStream = createReadStream(tempFileName);

    res.set({
      'Content-Disposition': `attachment; filename=${encodeURIComponent(
        filename,
      )}`,
    });

    res.set({
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });

    readStream.pipe(res);

    readStream.on('end', () => {
      unlinkSync(tempFileName);
    });
  } catch (error) {
    console.error(error);
    unlinkSync(tempFileName);
    res.status(500).send();
  }
}
