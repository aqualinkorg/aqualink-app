import { MigrationInterface, QueryRunner } from 'typeorm';

export class addConstraintForUniqueSignature1649940214017
  implements MigrationInterface
{
  name = 'addConstraintForUniqueSignature1649940214017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD CONSTRAINT "no_duplicate_signature" UNIQUE ("file", "signature")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP CONSTRAINT "no_duplicate_signature"`,
    );
  }
}
