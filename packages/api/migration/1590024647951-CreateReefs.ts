import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateReefs1590024647951 implements MigrationInterface {
    name = 'CreateReefs1590024647951'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reef" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "polygon" polygon NOT NULL, "region_id" integer NOT NULL, "temperature_threshold" integer NOT NULL, "depth" integer NOT NULL, "status" character varying NOT NULL, "admin_id" integer NOT NULL, "video_stream" character varying, "stream_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_ae886b4d9d8877affc5567dd4bf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4dd2eeb5079abc8e070e991528" ON "reef" USING GiST ("polygon") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_4dd2eeb5079abc8e070e991528"`);
        await queryRunner.query(`DROP TABLE "reef"`);
    }

}
