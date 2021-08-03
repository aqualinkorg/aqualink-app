import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSourceConstraint1627912428897 implements MigrationInterface {
  name = 'UpdateSourceConstraint1627912428897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sources" DROP CONSTRAINT "no_duplicate_sources"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "no_duplicate_sources" ON "sources" ("reef_id", COALESCE("poi_id", 0), "type", COALESCE("sensor_id", 'SPOT-IMPOSSIBLE'))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "no_duplicate_sources"`);
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "no_duplicate_sources" UNIQUE ("reef_id", "poi_id", "type")`,
    );
  }
}
