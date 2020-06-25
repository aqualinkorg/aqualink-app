import {MigrationInterface, QueryRunner} from "typeorm";

export class increaseColumnLength1593041550019 implements MigrationInterface {
    name = 'increaseColumnLength1593041550019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_af7cabf8e064aa7bad09c731ba"`);
        await queryRunner.query(`DROP INDEX "IDX_de4eb243bae87587f9ca56ba8d"`);
        await queryRunner.query(`DROP INDEX "IDX_cd07cbd734fb8d7d6417a8c936"`);
        await queryRunner.query(`DROP INDEX "IDX_9229452ed71aae8c51844ce86e"`);
        await queryRunner.query(`DROP INDEX "IDX_332a5f87cb3709f88980816dab"`);
        await queryRunner.query(`ALTER TABLE "region" ALTER COLUMN "polygon" TYPE geometry(Polygon)`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "full_name"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "full_name" character varying(254) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "organization"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "organization" character varying(254)`);
        await queryRunner.query(`ALTER TABLE "reef" ALTER COLUMN "polygon" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "reef" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reef" ALTER COLUMN "status" SET DEFAULT 0`);
        await queryRunner.query(`CREATE INDEX "IDX_af7cabf8e064aa7bad09c731ba" ON "user" USING GiST ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_de4eb243bae87587f9ca56ba8d" ON "video_stream" USING GiST ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_cd07cbd734fb8d7d6417a8c936" ON "spotter" USING GiST ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_9229452ed71aae8c51844ce86e" ON "survey_image" USING GiST ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_332a5f87cb3709f88980816dab" ON "survey_video" USING GiST ("location") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_332a5f87cb3709f88980816dab"`);
        await queryRunner.query(`DROP INDEX "IDX_9229452ed71aae8c51844ce86e"`);
        await queryRunner.query(`DROP INDEX "IDX_cd07cbd734fb8d7d6417a8c936"`);
        await queryRunner.query(`DROP INDEX "IDX_de4eb243bae87587f9ca56ba8d"`);
        await queryRunner.query(`DROP INDEX "IDX_af7cabf8e064aa7bad09c731ba"`);
        await queryRunner.query(`ALTER TABLE "reef" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "reef" ALTER COLUMN "status" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reef" ALTER COLUMN "polygon" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "organization"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "organization" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "full_name"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "full_name" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "region" ALTER COLUMN "polygon" TYPE geometry(POLYGON,0)`);
        await queryRunner.query(`CREATE INDEX "IDX_332a5f87cb3709f88980816dab" ON "survey_video" ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_9229452ed71aae8c51844ce86e" ON "survey_image" ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_cd07cbd734fb8d7d6417a8c936" ON "spotter" ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_de4eb243bae87587f9ca56ba8d" ON "video_stream" ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_af7cabf8e064aa7bad09c731ba" ON "user" ("location") `);
    }

}
