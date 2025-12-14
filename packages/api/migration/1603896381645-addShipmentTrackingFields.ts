import { MigrationInterface, QueryRunner } from 'typeorm';

export class addShipmentTrackingFields1603896381645 implements MigrationInterface {
  name = 'addShipmentTrackingFields1603896381645';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reef_application" ADD "target_shipdate" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_application" ADD "tracking_url" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reef_application" DROP COLUMN "tracking_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_application" DROP COLUMN "target_shipdate"`,
    );
  }
}
