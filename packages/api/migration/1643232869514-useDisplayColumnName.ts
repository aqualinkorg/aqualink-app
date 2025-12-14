import { MigrationInterface, QueryRunner } from 'typeorm';

export class useDisplayColumnName1643232869514 implements MigrationInterface {
  name = 'useDisplayColumnName1643232869514';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" RENAME COLUMN "approved" TO "display"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."site_audit_column_name_enum" RENAME TO "site_audit_column_name_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."site_audit_column_name_enum" AS ENUM('name', 'sensor_id', 'status', 'video_stream', 'max_monthly_mean', 'display')`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_audit" ALTER COLUMN "column_name" TYPE "text" USING "column_name"::"text"`,
    );
    await queryRunner.query(`UPDATE site_audit
                    SET column_name = 'display'
                    WHERE column_name = 'approved'`);
    await queryRunner.query(
      `ALTER TABLE "site_audit" ALTER COLUMN "column_name" TYPE "public"."site_audit_column_name_enum" USING "column_name"::"public"."site_audit_column_name_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."site_audit_column_name_enum_old"`,
    );

    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION log_site_change() RETURNS trigger AS $log_site_change$
        BEGIN
            IF NEW.name != OLD.name THEN
            INSERT INTO "site_audit" (old_value, new_value, site_id, column_name)
            VALUES (OLD.name, NEW.name, NEW.id, 'name');  
            END IF;

            IF NEW.sensor_id != OLD.sensor_id THEN
            INSERT INTO "site_audit" (old_value, new_value, site_id, column_name)
            VALUES (OLD.sensor_id, NEW.sensor_id, NEW.id, 'sensor_id');  
            END IF;

            IF NEW.status != OLD.status THEN
            INSERT INTO "site_audit" (old_value, new_value, site_id, column_name)
            VALUES (OLD.status, NEW.status, NEW.id, 'status');  
            END IF;

            IF NEW.video_stream != OLD.video_stream THEN
            INSERT INTO "site_audit" (old_value, new_value, site_id, column_name)
            VALUES (OLD.video_stream, NEW.video_stream, NEW.id, 'video_stream');  
            END IF;

            IF NEW.max_monthly_mean != OLD.max_monthly_mean THEN
            INSERT INTO "site_audit" (old_value, new_value, site_id, column_name)
            VALUES (OLD.max_monthly_mean, NEW.max_monthly_mean, NEW.id, 'max_monthly_mean');  
            END IF;

            IF NEW.display != OLD.display THEN
            INSERT INTO "site_audit" (old_value, new_value, site_id, column_name)
            VALUES (OLD.display, NEW.display, NEW.id, 'display');  
            END IF;

            RETURN NEW;
        END;
        $log_site_change$ LANGUAGE plpgsql;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" RENAME COLUMN "display" TO "approved"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."site_audit_column_name_enum_old" AS ENUM('name', 'sensor_id', 'status', 'video_stream', 'max_monthly_mean', 'approved')`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_audit" ALTER COLUMN "column_name" TYPE "public"."site_audit_column_name_enum_old" USING "column_name"::"text"::"public"."site_audit_column_name_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."site_audit_column_name_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."site_audit_column_name_enum_old" RENAME TO "site_audit_column_name_enum"`,
    );
  }
}
