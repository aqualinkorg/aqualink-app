import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSourceConstraint1627912428897 implements MigrationInterface {
  name = 'UpdateSourceConstraint1627912428897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sources" DROP CONSTRAINT "no_duplicate_sources"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_84204417a187000377a03dc532"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "no_duplicate_sources" ON "sources" ("reef_id", COALESCE("poi_id", 0), "type", COALESCE("sensor_id", 'SPOT-IMPOSSIBLE'))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "no_duplicate_sources"`);
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "no_duplicate_sources" UNIQUE ("reef_id", "poi_id", "type")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_84204417a187000377a03dc532" ON "sources" ("reef_id", "type") WHERE "poi_id" IS NULL`,
    );
  }
}
