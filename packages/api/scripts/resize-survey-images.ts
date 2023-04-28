import { Repository } from 'typeorm';
import yargs from 'yargs';
import axios from 'axios';
import { SurveyMedia } from '../src/surveys/survey-media.entity';
import { GoogleCloudService } from '../src/google-cloud/google-cloud.service';
import { getImageData, resize } from './utils/image';
import { getThumbnailBucketAndDestination } from '../src/utils/image-resize';
import AqualinkDataSource from '../ormconfig';

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
  surveyMedia: SurveyMedia,
  size: number,
  googleCloudService: GoogleCloudService,
  surveyMediaRepository: Repository<SurveyMedia>,
): Promise<'skipped' | 'success' | 'error'> => {
  const imageUrl = surveyMedia.url;
  const { id } = surveyMedia;

  const { bucket, destination } = getThumbnailBucketAndDestination(imageUrl);

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

    // Upload file to google cloud
    const res = await googleCloudService.uploadBufferToDestination(
      resizedBuffer,
      destination,
      bucket,
    );

    await surveyMediaRepository
      .createQueryBuilder()
      .update(SurveyMedia)
      .set({ thumbnailUrl: res })
      .where('id = :id', { id })
      .execute();

    return 'success';
  } catch (error: any) {
    console.error(error?.message || error);
    return 'error';
  }
};

async function main() {
  const conn = await AqualinkDataSource.initialize();
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
    const surveyMediaArray = await surveyMediaRepository
      .createQueryBuilder('survey_media')
      .select('survey_media.url')
      .addSelect('survey_media.id')
      .where('survey_media.thumbnail_url IS NULL')
      .getMany();

    await Promise.all(
      surveyMediaArray.map(async (surveyMedia) => {
        const result = await resizeImage(
          surveyMedia,
          size,
          googleCloudService,
          surveyMediaRepository,
        );
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
            failImages.push(surveyMedia.url);
            break;
          default:
        }
      }),
    );
  } catch (err) {
    console.error(`Creating resized survey images failed:\n${err}`);
    conn.destroy();
    process.exit(1);
  } finally {
    conn.destroy();
    if (failImages.length > 0) {
      console.log(
        `Images failed to resize:\n${failImages.map((x) => `${x}\n`).join('')}`,
      );
    }
    console.log(
      `Successfully resized: ${successCounter}\nFailed: ${failImages.length}\nSkipped: ${skippedCounter}`,
    );
  }
  process.exit(0);
}

main();
