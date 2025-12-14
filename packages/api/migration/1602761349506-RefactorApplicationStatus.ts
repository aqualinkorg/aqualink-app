import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorApplicationStatus1602761349506 implements MigrationInterface {
  name = 'RefactorApplicationStatus1602761349506';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const reefStatus = ['rejected', 'in_review', 'approved'];
    const reefs = await queryRunner.query('SELECT id, status FROM reef;');
    await queryRunner.query(`ALTER TABLE "reef" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "reef_status_enum" AS ENUM('in_review', 'rejected', 'approved')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef" ADD "status" "reef_status_enum" NOT NULL DEFAULT 'in_review'`,
    );
    const actions = reefs.map(({ id, status }) => {
      return queryRunner.query(
        `UPDATE reef SET status='${reefStatus[status + 1]}' WHERE id=${id}`,
      );
    });
    await Promise.all(actions);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const reefStatus = { rejected: -1, in_review: 0, approved: 1 };
    const reefs = await queryRunner.query('SELECT id, status FROM reef;');
    await queryRunner.query(`ALTER TABLE "reef" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "reef_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "reef" ADD "status" integer NOT NULL DEFAULT 0`,
    );
    const actions = reefs.map(({ id, status }) => {
      return queryRunner.query(
        `UPDATE reef SET status=${reefStatus[status]} WHERE id=${id}`,
      );
    });
    await Promise.all(actions);
  }
}
