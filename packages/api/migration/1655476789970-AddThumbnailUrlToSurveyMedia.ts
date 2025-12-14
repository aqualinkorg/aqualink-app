import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddThumbnailUrlToSurveyMedia1655476789970 implements MigrationInterface {
  name = 'AddThumbnailUrlToSurveyMedia1655476789970';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "survey_media" ADD "thumbnail_url" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "survey_media" DROP COLUMN "thumbnail_url"`,
    );
  }
}
