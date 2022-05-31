import { MigrationInterface, QueryRunner } from 'typeorm';

export class SiteSketchFab1654028837261 implements MigrationInterface {
  name = 'SiteSketchFab1654028837261';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "site_sketch_fab" ("id" SERIAL NOT NULL, "description" character varying, "scale" integer NOT NULL DEFAULT '1', "uuid" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "site_id" integer NOT NULL, CONSTRAINT "PK_01935eb152c3263060b41b1642c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_sketch_fab" ADD CONSTRAINT "FK_382bca33b0235e418995d0bec94" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site_sketch_fab" DROP CONSTRAINT "FK_382bca33b0235e418995d0bec94"`,
    );
    await queryRunner.query(`DROP TABLE "site_sketch_fab"`);
  }
}
