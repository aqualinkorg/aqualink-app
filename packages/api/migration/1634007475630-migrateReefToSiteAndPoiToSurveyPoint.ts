/* eslint-disable prettier/prettier */
 
import { MigrationInterface, QueryRunner } from "typeorm";

export class migrateReefToSiteAndPoiToSurveyPoint1634007475630 implements MigrationInterface {
    name = 'migrateReefToSiteAndPoiToSurveyPoint1634007475630'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // rename tables
        await queryRunner.query(`ALTER TABLE "collection_reefs_reef" RENAME TO "collection_sites_site"`);
        await queryRunner.query(`ALTER TABLE "reef" RENAME TO "site"`);
        await queryRunner.query(`ALTER TABLE "reef_application" RENAME TO "site_application"`);
        await queryRunner.query(`ALTER TABLE "reef_audit" RENAME TO "site_audit"`);
        await queryRunner.query(`ALTER TABLE "reef_point_of_interest" RENAME TO "site_survey_point"`);
        await queryRunner.query(`ALTER TABLE "users_administered_reefs_reef" RENAME TO "users_administered_sites_site"`);
        // rename fields - site
        await queryRunner.query(`ALTER TABLE "collection_sites_site" RENAME COLUMN "reef_id" TO "site_id"`);
        await queryRunner.query(`ALTER TABLE "daily_data" RENAME COLUMN "reef_id" TO "site_id"`);
        await queryRunner.query(`ALTER TABLE "historical_monthly_mean" RENAME COLUMN "reef_id" TO "site_id"`);
        await queryRunner.query(`ALTER TABLE "site_application" RENAME COLUMN "reef_id" TO "site_id"`);
        await queryRunner.query(`ALTER TABLE "site_audit" RENAME COLUMN "reef_id" TO "site_id"`);
        await queryRunner.query(`ALTER TABLE "site_survey_point" RENAME COLUMN "reef_id" TO "site_id"`);
        await queryRunner.query(`ALTER TABLE "sources" RENAME COLUMN "reef_id" TO "site_id"`);
        await queryRunner.query(`ALTER TABLE "survey" RENAME COLUMN "reef_id" TO "site_id"`);
        await queryRunner.query(`ALTER TABLE "users_administered_sites_site" RENAME COLUMN "reef_id" TO "site_id"`);
        // rename enums - site
        await queryRunner.query(`ALTER TYPE "reef_status_enum" RENAME TO "site_status_enum"`);
        await queryRunner.query(`ALTER TYPE "reef_audit_column_name_enum" RENAME TO "site_audit_column_name_enum"`);
        await queryRunner.query(`ALTER TYPE "users_admin_level_enum" RENAME TO "users_admin_level_enum_old"`);
        await queryRunner.query(`CREATE TYPE "users_admin_level_enum" AS ENUM('default', 'site_manager', 'super_admin')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "admin_level" DROP DEFAULT`);
        await queryRunner.query(`
          ALTER TABLE "users" ALTER COLUMN "admin_level" TYPE "users_admin_level_enum"
          USING CASE
          WHEN admin_level = 'reef_manager'
          THEN 'site_manager'::"text"::users_admin_level_enum
          ELSE admin_level::"text"::users_admin_level_enum
          END;`
        );
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "admin_level" SET DEFAULT 'default'`);
        await queryRunner.query(`DROP TYPE "users_admin_level_enum_old"`);
        // rename fields - survey point
        await queryRunner.query(`ALTER TABLE "site_survey_point" RENAME COLUMN "poi_label_id" TO "survey_point_label_id"`);
        await queryRunner.query(`ALTER TABLE "sources" RENAME COLUMN "poi_id" TO "survey_point_id"`);
        await queryRunner.query(`ALTER TABLE "survey_media" RENAME COLUMN "poi_id" TO "survey_point_id"`);
        // audit table
        await queryRunner.query(`DROP TRIGGER IF EXISTS reef_trigger ON site`);
        await queryRunner.query(`ALTER FUNCTION log_reef_change RENAME TO log_site_change`);
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

            IF NEW.approved != OLD.approved THEN
            INSERT INTO "site_audit" (old_value, new_value, site_id, column_name)
            VALUES (OLD.approved, NEW.approved, NEW.id, 'approved');  
            END IF;

            RETURN NEW;
        END;
        $log_site_change$ LANGUAGE plpgsql;
    `);
        await queryRunner.query(`
          CREATE TRIGGER site_trigger AFTER UPDATE ON site
          FOR EACH ROW
          EXECUTE PROCEDURE log_site_change()
        `);
          // materialized view
          await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);
          await queryRunner.query(
              `CREATE MATERIALIZED VIEW "latest_data" AS
                SELECT 
                "time_series".id,
                "time_series".metric,
                "time_series".timestamp,
                "time_series".value,
                "source"."type" AS "source",
                "source"."site_id" AS "site_id",
                "source"."survey_point_id" AS "survey_point_id"
                FROM 
                  (SELECT
                    DISTINCT ON (metric, source_id) metric AS "metric",
                    id,
                    timestamp,
                    value,
                    source_id
                  FROM "time_series" "time_series"
                  ORDER BY metric, source_id, timestamp DESC) "time_series"
                INNER JOIN "sources" "source" ON "source"."id" = "time_series"."source_id"`,
            );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // rename tables
        await queryRunner.query(`ALTER TABLE "collection_sites_site" RENAME TO "collection_reefs_reef"`);
        await queryRunner.query(`ALTER TABLE "site" RENAME TO "reef"`);
        await queryRunner.query(`ALTER TABLE "site_application" RENAME TO "reef_application"`);
        await queryRunner.query(`ALTER TABLE "site_audit" RENAME TO "reef_audit"`);
        await queryRunner.query(`ALTER TABLE "site_survey_point" RENAME TO "reef_point_of_interest"`);
        await queryRunner.query(`ALTER TABLE "users_administered_sites_site" RENAME TO "users_administered_reefs_reef"`);
        // rename fields - site
        await queryRunner.query(`ALTER TABLE "collection_sites_site" RENAME COLUMN "site_id" TO "reef_id"`);
        await queryRunner.query(`ALTER TABLE "daily_data" RENAME COLUMN "site_id" TO "reef_id"`);
        await queryRunner.query(`ALTER TABLE "historical_monthly_mean" RENAME COLUMN "site_id" TO "reef_id"`);
        await queryRunner.query(`ALTER TABLE "site_application" RENAME COLUMN "site_id" TO "reef_id"`);
        await queryRunner.query(`ALTER TABLE "site_audit" RENAME COLUMN "site_id" TO "reef_id"`);
        await queryRunner.query(`ALTER TABLE "site_survey_point" RENAME COLUMN "site_id" TO "reef_id"`);
        await queryRunner.query(`ALTER TABLE "sources" RENAME COLUMN "site_id" TO "reef_id"`);
        await queryRunner.query(`ALTER TABLE "survey" RENAME COLUMN "site_id" TO "reef_id"`);
        await queryRunner.query(`ALTER TABLE "users_administered_reefs_reef" RENAME COLUMN "site_id" TO "reef_id"`);
        // rename enums - site
        await queryRunner.query(`ALTER TYPE "site_status_enum" RENAME TO "reef_status_enum"`);
        await queryRunner.query(`ALTER TYPE "site_audit_column_name_enum" RENAME TO "reef_audit_column_name_enum"`);
        await queryRunner.query(`ALTER TYPE "users_admin_level_enum" RENAME TO "users_admin_level_enum_old"`);
        await queryRunner.query(`CREATE TYPE "users_admin_level_enum" AS ENUM('default', 'reef_manager', 'super_admin')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "admin_level" DROP DEFAULT`);
        await queryRunner.query(`
          ALTER TABLE "users" ALTER COLUMN "admin_level" TYPE "users_admin_level_enum"
          USING CASE
          WHEN admin_level = 'site_manager'
          THEN 'reef_manager'::"text"::users_admin_level_enum
          ELSE admin_level::"text"::users_admin_level_enum
          END;`
        );
        await queryRunner.query(`DROP TYPE "users_admin_level_enum_old"`);
        // rename fields - survey point
        await queryRunner.query(`ALTER TABLE "site_survey_point" RENAME COLUMN "survey_point_label_id" TO "poi_label_id"`);
        await queryRunner.query(`ALTER TABLE "sources" RENAME COLUMN "survey_point_id" TO "poi_id"`);
        await queryRunner.query(`ALTER TABLE "survey_media" RENAME COLUMN "survey_point_id" TO "poi_id"`);
        // audit table
        await queryRunner.query(`DROP TRIGGER IF EXISTS site_trigger ON reef`);
        await queryRunner.query(`ALTER FUNCTION log_site_change RENAME TO log_reef_change`);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION log_reef_change() RETURNS trigger AS $log_reef_change$
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
          // materialized view
          await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);
          await queryRunner.query(
              `CREATE MATERIALIZED VIEW "latest_data" AS
                SELECT 
                "time_series".id,
                "time_series".metric,
                "time_series".timestamp,
                "time_series".value,
                "source"."type" AS "source",
                "source"."reef_id" AS "site_id",
                "source"."poi_id" AS "poi_id"
                FROM 
                  (SELECT
                    DISTINCT ON (metric, source_id) metric AS "metric",
                    id,
                    timestamp,
                    value,
                    source_id
                  FROM "time_series" "time_series"
                  ORDER BY metric, source_id, timestamp DESC) "time_series"
                INNER JOIN "sources" "source" ON "source"."id" = "time_series"."source_id"`,
            );
    }

}
