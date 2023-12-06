import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSourcesUniqueCondition1698222737378
  implements MigrationInterface
{
  name = 'UpdateSourcesUniqueCondition1698222737378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."no_duplicate_sources"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "no_duplicate_sources" ON "sources" ("site_id", COALESCE("survey_point_id", 0), "type", COALESCE("sensor_id", 'SPOT-IMPOSSIBLE'), COALESCE("depth", 0))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."no_duplicate_sources"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "no_duplicate_sources" ON "sources" ("site_id", COALESCE("survey_point_id", 0), "type", COALESCE("sensor_id", 'SPOT-IMPOSSIBLE'))`,
    );
  }
}
