import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSourceConstraint1627912428897 implements MigrationInterface {
  name = 'UpdateSourceConstraint1627912428897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_84204417a187000377a03dc532"`);
    await queryRunner.query(
      `ALTER TABLE "sources" DROP CONSTRAINT "no_duplicate_sources"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e67d06022c484ed9b3688160d8" ON "sources" ("reef_id", "type", "sensor_id") WHERE "poi_id" IS NULL AND sensor_id IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_691a70241b9b1b0a2ffa301507" ON "sources" ("reef_id", "type") WHERE "poi_id" IS NULL AND sensor_id IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "no_duplicate_sources" ON "sources" ("reef_id", "poi_id", "type") WHERE "poi_id" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "no_duplicate_sources"`);
    await queryRunner.query(`DROP INDEX "IDX_691a70241b9b1b0a2ffa301507"`);
    await queryRunner.query(`DROP INDEX "IDX_e67d06022c484ed9b3688160d8"`);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_84204417a187000377a03dc532" ON "sources" ("type", "reef_id") WHERE (poi_id IS NULL)`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "no_duplicate_sources" UNIQUE ("reef_id", "poi_id", "type")`,
    );
  }
}
