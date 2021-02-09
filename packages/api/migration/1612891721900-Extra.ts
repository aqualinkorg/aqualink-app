import { MigrationInterface, QueryRunner } from 'typeorm';

export class Extra1612891721900 implements MigrationInterface {
  name = 'Extra1612891721900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reef_application" DROP CONSTRAINT "FK_77d33d9b9602120cd1529312e77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_application" ADD CONSTRAINT "UQ_77d33d9b9602120cd1529312e77" UNIQUE ("reef_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_application" ADD CONSTRAINT "FK_77d33d9b9602120cd1529312e77" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reef_application" DROP CONSTRAINT "UQ_77d33d9b9602120cd1529312e77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_application" ADD CONSTRAINT "FK_77d33d9b9602120cd1529312e77" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
