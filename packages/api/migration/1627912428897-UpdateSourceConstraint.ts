import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSourceConstraint1627912428897 implements MigrationInterface {
  name = 'UpdateSourceConstraint1627912428897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_84204417a187000377a03dc532"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_7194f800a252ab23d85f8dbf13" ON "sources" ("reef_id", "type", "sensor_id") WHERE "poi_id" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_7194f800a252ab23d85f8dbf13"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_84204417a187000377a03dc532" ON "sources" ("type", "reef_id") WHERE (poi_id IS NULL)`,
    );
  }
}
