import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddThumbnailUrlToSurveyMedia1655476789970
  implements MigrationInterface
{
  name = 'AddThumbnailUrlToSurveyMedia1655476789970';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "survey_media" RENAME COLUMN "url" TO "original_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey_media" ADD "thumbnail_url" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "survey_media" DROP COLUMN "thumbnail_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey_media" RENAME COLUMN "original_url" TO "url"`,
    );
  }
}
