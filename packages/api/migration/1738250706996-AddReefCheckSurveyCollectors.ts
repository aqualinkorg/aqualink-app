import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReefCheckSurveyCollectors1738250706996 implements MigrationInterface {
  name = 'AddReefCheckSurveyCollectors1738250706996';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reef_check_survey" ADD "team_leader" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_check_survey" ADD "team_scientist" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reef_check_survey" DROP COLUMN "team_scientist"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_check_survey" DROP COLUMN "team_leader"`,
    );
  }
}
