import { MigrationInterface, QueryRunner } from 'typeorm';

export class DataUploadsAddCreatedUpdatedColumns1643364520677 implements MigrationInterface {
  name = 'DataUploadsAddCreatedUpdatedColumns1643364520677';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP COLUMN "created_at"`,
    );
  }
}
