import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMonthlyMax1613766723577 implements MigrationInterface {
  name = 'AddMonthlyMax1613766723577';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "monthly_max" ("id" SERIAL NOT NULL, "month" integer NOT NULL, "temperature" double precision NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "reef_id" integer, CONSTRAINT "UQ_MONTHS" UNIQUE ("reef_id", "month"), CONSTRAINT "PK_14827b8f97d760ba01c95ee4775" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "monthly_max" ADD CONSTRAINT "FK_787e2b4cca2114ef07793eb9be9" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP TABLE "monthly_temperature_threshold"`);
    await queryRunner.query(
      `ALTER TABLE "monthly_max" ADD CONSTRAINT no_duplicated_month EXCLUDE USING GIST (reef_id WITH =, month WITH =)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "monthly_max"`);
  }
}
