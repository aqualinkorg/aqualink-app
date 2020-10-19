import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExclusionDatesTable1602489219253 implements MigrationInterface {
  name = 'AddExclusionDatesTable1602489219253';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      CREATE TABLE "exclusion_dates" (
        "id" SERIAL NOT NULL,
        "spotter_id" character varying NOT NULL,
        "start_date" TIMESTAMP NOT NULL,
        "end_date" TIMESTAMP NOT NULL,
        CONSTRAINT "no_duplicates_start_date" UNIQUE ("spotter_id", "start_date"),
        CONSTRAINT "no_duplicate_end_date" UNIQUE ("spotter_id", "end_date"),
        CONSTRAINT "PK_453a43baeaf71c69b10b159c726" PRIMARY KEY ("id")
      )
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "exclusion_dates"`);
  }
}
