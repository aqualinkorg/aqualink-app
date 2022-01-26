import {MigrationInterface, QueryRunner} from "typeorm";

export class useDisplayColumnName1643232869514 implements MigrationInterface {
    name = 'useDisplayColumnName1643232869514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site" RENAME COLUMN "approved" TO "display"`);

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
        await queryRunner.query(`ALTER TABLE "site" RENAME COLUMN "display" TO "approved"`);
    }

}
