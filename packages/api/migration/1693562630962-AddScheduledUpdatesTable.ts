import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScheduledUpdatesTable1693562630962
  implements MigrationInterface
{
  name = 'AddScheduledUpdatesTable1693562630962';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "scheduled_update" ("id" SERIAL NOT NULL, "site_id" integer NOT NULL, CONSTRAINT "PK_192e2322a4b9c2da520537a2a46" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_658dfd2b982a40e1928c46fbab" ON "scheduled_update" ("site_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduled_update" ADD CONSTRAINT "FK_658dfd2b982a40e1928c46fbab2" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scheduled_update" DROP CONSTRAINT "FK_658dfd2b982a40e1928c46fbab2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_658dfd2b982a40e1928c46fbab"`,
    );
    await queryRunner.query(`DROP TABLE "scheduled_update"`);
  }
}
