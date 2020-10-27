import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddThumbnailInMedia1603786749193 implements MigrationInterface {
  name = 'AddThumbnailInMedia1603786749193';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "survey_media" RENAME COLUMN "url" TO "original"`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey_media" ADD "thumbnail" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "survey_media" DROP COLUMN "thumbnail"`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey_media" RENAME COLUMN "original" TO "url"`,
    );
  }
}
