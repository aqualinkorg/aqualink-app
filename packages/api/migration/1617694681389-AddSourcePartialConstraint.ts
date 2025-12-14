import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourcePartialConstraint1617694681389 implements MigrationInterface {
  name = 'AddSourcePartialConstraint1617694681389';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_84204417a187000377a03dc532" ON "sources" ("reef_id", "type") WHERE "poi_id" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_84204417a187000377a03dc532"`);
  }
}
