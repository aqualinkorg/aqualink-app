import { MigrationInterface, QueryRunner } from 'typeorm';

export class SiteSketchFab1654028837261 implements MigrationInterface {
  name = 'SiteSketchFab1654028837261';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sketch_fab" ("id" SERIAL NOT NULL, "description" character varying, "scale" integer NOT NULL DEFAULT '1', "uuid" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "site_id" integer NOT NULL, CONSTRAINT "PK_1cec7e515d2ffde3d189fd9bc79" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sketch_fab" ADD CONSTRAINT "FK_6f7e22a9fea6ffe85ee8249bdca" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sketch_fab" DROP CONSTRAINT "FK_6f7e22a9fea6ffe85ee8249bdca"`,
    );
    await queryRunner.query(`DROP TABLE "sketch_fab"`);
  }
}
