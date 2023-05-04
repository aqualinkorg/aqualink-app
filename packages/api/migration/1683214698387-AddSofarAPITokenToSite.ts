import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSofarAPITokenToSite1683214698387 implements MigrationInterface {
  name = 'AddSofarAPITokenToSite1683214698387';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" ADD "sofar_api_token" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_audit" ALTER COLUMN "old_value" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_audit" ALTER COLUMN "new_value" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."site_audit_column_name_enum" RENAME TO "site_audit_column_name_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."site_audit_column_name_enum" AS ENUM('name', 'sensor_id', 'status', 'video_stream', 'max_monthly_mean', 'display', 'sofarApiToken')`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_audit" ALTER COLUMN "column_name" TYPE "public"."site_audit_column_name_enum" USING "column_name"::"text"::"public"."site_audit_column_name_enum"`,
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

            IF (NEW.sofar_api_token is null and OLD.sofar_api_token is not null)
              OR (NEW.sofar_api_token is not null and OLD.sofar_api_token is null)
              OR (NEW.sofar_api_token != OLD.sofar_api_token) 
            THEN
            INSERT INTO "site_audit" (old_value, new_value, site_id, column_name)
            VALUES (OLD.sofar_api_token, NEW.sofar_api_token, NEW.id, 'sofarApiToken');  
            END IF;

            RETURN NEW;
        END;
        $log_site_change$ LANGUAGE plpgsql;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
    await queryRunner.query(
      `CREATE TYPE "public"."site_audit_column_name_enum_old" AS ENUM('display', 'max_monthly_mean', 'name', 'sensor_id', 'status', 'video_stream')`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_audit" ALTER COLUMN "column_name" TYPE "public"."site_audit_column_name_enum_old" USING "column_name"::"text"::"public"."site_audit_column_name_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."site_audit_column_name_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."site_audit_column_name_enum_old" RENAME TO "site_audit_column_name_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_audit" ALTER COLUMN "new_value" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_audit" ALTER COLUMN "old_value" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "sofar_api_token"`);
  }
}
