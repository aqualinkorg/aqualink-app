import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExclusionDatesTable1602489219253 implements MigrationInterface {
  name = 'AddExclusionDatesTable1602489219253';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      CREATE TABLE "exclusion_dates" (
        "id" SERIAL NOT NULL,
        "spotter_id" character varying NOT NULL,
        "date" TIMESTAMP NOT NULL,
        CONSTRAINT "no_duplicates_exclusion_dates" UNIQUE ("spotter_id", "date"),
        CONSTRAINT "PK_453a43baeaf71c69b10b159c726" PRIMARY KEY ("id")
      )
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "exclusion_dates"`);
  }
}
