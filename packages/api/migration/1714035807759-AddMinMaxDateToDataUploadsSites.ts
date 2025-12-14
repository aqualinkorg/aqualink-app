import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMinMaxDateToDataUploadsSites1714035807759 implements MigrationInterface {
  name = 'AddMinMaxDateToDataUploadsSites1714035807759';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads_sites" ADD "min_date" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads_sites" ADD "max_date" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads_sites" DROP COLUMN "max_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads_sites" DROP COLUMN "min_date"`,
    );
  }
}
