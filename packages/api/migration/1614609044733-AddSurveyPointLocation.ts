import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSurveyPointLocation1614609044733 implements MigrationInterface {
  name = 'AddSurveyPointLocation1614609044733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reef_point_of_interest" ADD "polygon" geometry`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_point_of_interest" ADD CONSTRAINT "UQ_7d7b340adbd0c281abf2dd56917" UNIQUE ("polygon")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7d7b340adbd0c281abf2dd56917" ON "reef_point_of_interest" USING GIST ("polygon")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reef_point_of_interest" DROP CONSTRAINT "UQ_7d7b340adbd0c281abf2dd56917"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_7d7b340adbd0c281abf2dd56917"`);
    await queryRunner.query(
      `ALTER TABLE "reef_point_of_interest" DROP COLUMN "polygon"`,
    );
  }
}
