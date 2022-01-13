import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileColumnOnDataUploadsTable1642082836579
  implements MigrationInterface
{
  name = 'AddFileColumnOnDataUploadsTable1642082836579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD "file" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "data_uploads" DROP COLUMN "file"`);
  }
}
