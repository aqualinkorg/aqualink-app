import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNOAAAvailabilityColumn1666786316691 implements MigrationInterface {
  name = 'AddNOAAAvailabilityColumn1666786316691';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" ADD "nearest_noaa_location" geometry`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" DROP COLUMN "nearest_noaa_location"`,
    );
  }
}
