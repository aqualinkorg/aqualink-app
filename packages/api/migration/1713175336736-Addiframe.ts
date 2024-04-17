import { MigrationInterface, QueryRunner } from 'typeorm';

export class Addiframe1713175336736 implements MigrationInterface {
  name = 'Addiframe1713175336736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "iframe" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ADD CONSTRAINT "CHK_317e682d4de8cd07bf9ee3dc57" CHECK (char_length(iframe) <= 200 AND char_length(iframe) > 10)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" DROP CONSTRAINT "CHK_317e682d4de8cd07bf9ee3dc57"`,
    );
    await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "iframe"`);
  }
}
