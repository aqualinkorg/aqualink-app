import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintsOnTimeSeries1614851566644 implements MigrationInterface {
  name = 'AddUniqueConstraintsOnTimeSeries1614851566644';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "no_duplicate_sources" UNIQUE ("reef_id", "poi_id", "type")`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_data" UNIQUE ("timestamp", "reef_id", "poi_id", "metric", "source_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_data"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" DROP CONSTRAINT "no_duplicate_sources"`,
    );
  }
}
