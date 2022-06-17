import { createConnection } from 'typeorm';
import yargs from 'yargs';
import axios from 'axios';
import { SurveyMedia } from '../src/surveys/survey-media.entity';
import { GoogleCloudService } from '../src/google-cloud/google-cloud.service';
import { getImageData, resize } from './utils/image';

const dbConfig = require('../ormconfig');

// Initialize command definition
const { argv } = yargs
  .scriptName('resize-survey-images')
  .usage('$0 <cmd> [args]')
  .option('s', {
    alias: 'size',
    describe: 'The size to resize images to',
    type: 'number',
    demandOption: true,
  })
  // Extend definition to use the full-width of the terminal
  .wrap(yargs.terminalWidth());

const resizeImage = async (
  imageUrl: string,
  size: number,
  googleCloudService: GoogleCloudService,
): Promise<'skipped' | 'success' | 'error'> => {
  // remove 'https://' from the string
  const trimmed = imageUrl.substring(8);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_domain, bucket, ...rest] = trimmed.split('/');

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });
    const imageBuffer = Buffer.from(response.data, 'utf-8');
    const imageDetails = await getImageData(imageBuffer);
    if ((imageDetails.width || 0) <= size) {
      return 'skipped';
    }
    const resizedBuffer = await resize(imageBuffer, size);

    // eslint-disable-next-line fp/no-mutation
    rest[rest.length - 1] = `thumbnail-${rest[rest.length - 1]}`;
    // Upload file to google cloud
    const destination = rest.join('/');

    const res = await googleCloudService.uploadBufferToDestination(
      resizedBuffer,
      destination,
      bucket,
    );

    console.log(res);

    return 'success';
  } catch (error: any) {
    console.error(error?.message || error);
    return 'error';
  }
};

async function main() {
  const conn = await createConnection(dbConfig);
  // Extract command line arguments
  const { s: size } = argv;
  console.log(`running for size: ${size}`);

  // Initialize google cloud service, to be used for media upload
  const googleCloudService = new GoogleCloudService();

  const failImages: string[] = [];
  let successCounter = 0;
  let skippedCounter = 0;
  try {
    const surveyMediaRepository = conn.getRepository(SurveyMedia);
    const surveyMedia = await surveyMediaRepository
      .createQueryBuilder('survey_media')
      .select('survey_media.url')
      .getMany();
    const imageUrls = surveyMedia.map((s) => s.url);

    await Promise.all(
      imageUrls.map(async (imageUrl) => {
        const result = await resizeImage(imageUrl, size, googleCloudService);
        switch (result) {
          case 'success':
            // eslint-disable-next-line fp/no-mutation
            successCounter += 1;
            break;
          case 'skipped':
            // eslint-disable-next-line fp/no-mutation
            skippedCounter += 1;
            break;
          case 'error':
            // eslint-disable-next-line fp/no-mutating-methods
            failImages.push(imageUrl);
            break;
          default:
        }
      }),
    );
  } catch (err) {
    console.error(`Creating resized survey images failed:\n${err}`);
    conn.close();
    process.exit(1);
  } finally {
    conn.close();
    if (failImages.length > 0) {
      console.log(
        `Images failed to resize:\n${failImages.map((x) => `${x}\n`)}`,
      );
    }
    console.log(
      `Successfully resized: ${successCounter}\nFailed: ${failImages.length}\nSkipped: ${skippedCounter}`,
    );
  }
  process.exit(0);
}

main();
