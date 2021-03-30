import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourceUniqueConstraint1617095334112
  implements MigrationInterface {
  name = 'AddSourceUniqueConstraint1617095334112';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "no_duplicate_reef_sources" UNIQUE ("reef_id", "type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sources" DROP CONSTRAINT "no_duplicate_reef_sources"`,
    );
  }
}
