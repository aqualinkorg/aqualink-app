import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSurveyMediaNullConstraint1599137883325
  implements MigrationInterface {
  name = 'FixSurveyMediaNullConstraint1599137883325';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "survey_media" ALTER COLUMN "comments" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "survey_media" ALTER COLUMN "comments" SET NOT NULL`,
    );
  }
}
