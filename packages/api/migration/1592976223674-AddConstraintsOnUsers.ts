import {MigrationInterface, QueryRunner} from "typeorm";

export class AddConstraintsOnUsers1592976223674 implements MigrationInterface {
    name = 'AddConstraintsOnUsers1592976223674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_46b146ce5d6ee2de43d8448562"`);
        await queryRunner.query(`DROP INDEX "IDX_af7cabf8e064aa7bad09c731ba"`);
        await queryRunner.query(`DROP INDEX "IDX_de4eb243bae87587f9ca56ba8d"`);
        await queryRunner.query(`DROP INDEX "IDX_4dd2eeb5079abc8e070e991528"`);
        await queryRunner.query(`DROP INDEX "IDX_cd07cbd734fb8d7d6417a8c936"`);
        await queryRunner.query(`DROP INDEX "IDX_9229452ed71aae8c51844ce86e"`);
        await queryRunner.query(`DROP INDEX "IDX_332a5f87cb3709f88980816dab"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "firebase_uid" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_46b146ce5d6ee2de43d8448562" ON "region" USING GiST ("polygon") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_af7cabf8e064aa7bad09c731ba" ON "user" USING GiST ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_de4eb243bae87587f9ca56ba8d" ON "video_stream" USING GiST ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_4dd2eeb5079abc8e070e991528" ON "reef" USING GiST ("polygon") `);
        await queryRunner.query(`CREATE INDEX "IDX_cd07cbd734fb8d7d6417a8c936" ON "spotter" USING GiST ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_9229452ed71aae8c51844ce86e" ON "survey_image" USING GiST ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_332a5f87cb3709f88980816dab" ON "survey_video" USING GiST ("location") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_332a5f87cb3709f88980816dab"`);
        await queryRunner.query(`DROP INDEX "IDX_9229452ed71aae8c51844ce86e"`);
        await queryRunner.query(`DROP INDEX "IDX_cd07cbd734fb8d7d6417a8c936"`);
        await queryRunner.query(`DROP INDEX "IDX_4dd2eeb5079abc8e070e991528"`);
        await queryRunner.query(`DROP INDEX "IDX_de4eb243bae87587f9ca56ba8d"`);
        await queryRunner.query(`DROP INDEX "IDX_af7cabf8e064aa7bad09c731ba"`);
        await queryRunner.query(`DROP INDEX "IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP INDEX "IDX_46b146ce5d6ee2de43d8448562"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "firebase_uid" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_332a5f87cb3709f88980816dab" ON "survey_video" ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_9229452ed71aae8c51844ce86e" ON "survey_image" ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_cd07cbd734fb8d7d6417a8c936" ON "spotter" ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_4dd2eeb5079abc8e070e991528" ON "reef" ("polygon") `);
        await queryRunner.query(`CREATE INDEX "IDX_de4eb243bae87587f9ca56ba8d" ON "video_stream" ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_af7cabf8e064aa7bad09c731ba" ON "user" ("location") `);
        await queryRunner.query(`CREATE INDEX "IDX_46b146ce5d6ee2de43d8448562" ON "region" ("polygon") `);
    }

}
