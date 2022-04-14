import { MigrationInterface, QueryRunner } from 'typeorm';

export class addGCloudLocationForDataUploads1649940478607
  implements MigrationInterface
{
  name = 'addGCloudLocationForDataUploads1649940478607';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD "g_cloud_location" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP COLUMN "g_cloud_location"`,
    );
  }
}
