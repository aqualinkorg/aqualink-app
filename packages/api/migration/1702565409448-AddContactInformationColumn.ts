import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactInformationColumn1702565409448 implements MigrationInterface {
  name = 'AddContactInformationColumn1702565409448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" ADD "contact_information" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" DROP COLUMN "contact_information"`,
    );
  }
}
