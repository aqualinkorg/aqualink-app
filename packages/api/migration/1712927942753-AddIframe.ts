import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIframe1712927942753 implements MigrationInterface {
  name = 'AddIframe1712927942753';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" ADD "iframe" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "iframe"`);
  }
}
