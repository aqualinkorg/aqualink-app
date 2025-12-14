import { MigrationInterface, QueryRunner } from 'typeorm';

// IMPORTANT: Replace 1744966607999-RemoveUniqueConstraintFromReefCheckSiteSiteId with the actual generated class name
export class RemoveUniqueConstraintFromReefCheckSiteSiteId1744966607999 implements MigrationInterface {
  // Use the actual constraint name found in migration 1731505574037
  name = 'RemoveUniqueConstraintFromReefCheckSiteSiteId1744966607999'; // Replace 1744966607999
  constraintName = 'REL_228715834910cd57948e2d2dbd';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique constraint on the site_id column
    await queryRunner.query(
      `ALTER TABLE "reef_check_site" DROP CONSTRAINT "${this.constraintName}"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add the unique constraint on the site_id column
    await queryRunner.query(
      `ALTER TABLE "reef_check_site" ADD CONSTRAINT "${this.constraintName}" UNIQUE ("site_id")`,
    );
  }
}
