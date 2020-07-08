import { MigrationInterface, QueryRunner } from "typeorm";

export class waveHeightNotLength1594166316583 implements MigrationInterface {
    name = 'waveHeightNotLength1594166316583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_data" DROP COLUMN "min_wave_speed"`);
        await queryRunner.query(`ALTER TABLE "daily_data" DROP COLUMN "max_wave_speed"`);
        await queryRunner.query(`ALTER TABLE "daily_data" DROP COLUMN "avg_wave_speed"`);
        await queryRunner.query(`ALTER TABLE "daily_data" ADD "min_wave_height" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "daily_data" ADD "max_wave_height" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "daily_data" ADD "avg_wave_height" double precision NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_data" DROP COLUMN "avg_wave_height"`);
        await queryRunner.query(`ALTER TABLE "daily_data" DROP COLUMN "max_wave_height"`);
        await queryRunner.query(`ALTER TABLE "daily_data" DROP COLUMN "min_wave_height"`);
        await queryRunner.query(`ALTER TABLE "daily_data" ADD "avg_wave_speed" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "daily_data" ADD "max_wave_speed" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "daily_data" ADD "min_wave_speed" double precision NOT NULL`);
    }
}
