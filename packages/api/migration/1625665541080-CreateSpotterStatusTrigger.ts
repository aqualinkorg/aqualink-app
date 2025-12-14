import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSpotterStatusTrigger1625665541080 implements MigrationInterface {
  name = 'CreateSpotterStatusTrigger1625665541080';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "reef_audit_column_name_enum" AS ENUM('name', 'sensor_id', 'status', 'video_stream', 'max_monthly_mean', 'approved')`,
    );

    await queryRunner.query(
      `CREATE TABLE "reef_audit" (
        "id" SERIAL NOT NULL,
        "old_value" character varying NOT NULL,
        "new_value" character varying NOT NULL,
        "column_name" "reef_audit_column_name_enum" NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "reef_id" integer NOT NULL,
        CONSTRAINT "PK_7f6af35314375cb41f9bebb1baf" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_abbd8ec473bccd8696f74d654c" ON "reef_audit" ("old_value") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8517aece6ef181f640a5915d31" ON "reef_audit" ("new_value") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e3f8d897db207896108636769a" ON "reef_audit" ("created_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_audit" ADD CONSTRAINT "FK_8fadafdfdbb6c163a0120ca1e3b" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`
      CREATE FUNCTION log_reef_change() RETURNS trigger AS $log_reef_change$
        BEGIN

          IF NEW.name != OLD.name THEN
            INSERT INTO "reef_audit" (old_value, new_value, reef_id, column_name)
            VALUES (OLD.name, NEW.name, NEW.id, 'name');  
          END IF;

          IF NEW.sensor_id != OLD.sensor_id THEN
            INSERT INTO "reef_audit" (old_value, new_value, reef_id, column_name)
            VALUES (OLD.sensor_id, NEW.sensor_id, NEW.id, 'sensor_id');  
          END IF;

          IF NEW.status != OLD.status THEN
            INSERT INTO "reef_audit" (old_value, new_value, reef_id, column_name)
            VALUES (OLD.status, NEW.status, NEW.id, 'status');  
          END IF;

          IF NEW.video_stream != OLD.video_stream THEN
            INSERT INTO "reef_audit" (old_value, new_value, reef_id, column_name)
            VALUES (OLD.video_stream, NEW.video_stream, NEW.id, 'video_stream');  
          END IF;

          IF NEW.max_monthly_mean != OLD.max_monthly_mean THEN
            INSERT INTO "reef_audit" (old_value, new_value, reef_id, column_name)
            VALUES (OLD.max_monthly_mean, NEW.max_monthly_mean, NEW.id, 'max_monthly_mean');  
          END IF;

          IF NEW.approved != OLD.approved THEN
            INSERT INTO "reef_audit" (old_value, new_value, reef_id, column_name)
            VALUES (OLD.approved, NEW.approved, NEW.id, 'approved');  
          END IF;

          RETURN NEW;
        END;
      $log_reef_change$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER reef_trigger AFTER UPDATE ON reef
      FOR EACH ROW
      EXECUTE PROCEDURE log_reef_change()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "reef_audit"`);
    await queryRunner.query(`DROP TYPE "reef_audit_column_name_enum"`);

    await queryRunner.query('DROP TRIGGER "reef_trigger" ON "reef"');
    await queryRunner.query('DROP FUNCTION log_reef_change()');
  }
}
