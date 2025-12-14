import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForeignKeyToTimeSeriesReferencingDataUploads1649334332499 implements MigrationInterface {
  name = 'AddForeignKeyToTimeSeriesReferencingDataUploads1649334332499';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD "data_upload_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_1af2c9ad7947284ec12ba3d04d1" FOREIGN KEY ("data_upload_id") REFERENCES "data_uploads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD CONSTRAINT "no_duplicate_signature" UNIQUE ("file", "signature")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "FK_1af2c9ad7947284ec12ba3d04d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP COLUMN "data_upload_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP CONSTRAINT "no_duplicate_signature"`,
    );
  }
}
