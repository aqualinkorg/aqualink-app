import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueIndex1612891721900 implements MigrationInterface {
  name = 'AddUniqueIndex1612891721900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reef_application" ADD CONSTRAINT "UQ_77d33d9b9602120cd1529312e77" UNIQUE ("reef_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reef_application" DROP CONSTRAINT "UQ_77d33d9b9602120cd1529312e77"`,
    );
  }
}
