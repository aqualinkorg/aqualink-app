import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveBristlemouthNodeId1770032066107 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" DROP COLUMN IF EXISTS "bristlemouth_node_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" ADD COLUMN "bristlemouth_node_id" character varying(50)`,
    );
  }
}
