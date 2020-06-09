import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeReefDateTypes1591728518804 implements MigrationInterface {
    name = 'ChangeReefDateTypes1591728518804'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_4dd2eeb5079abc8e070e991528"`);
        await queryRunner.query(`ALTER TABLE "reef" ALTER COLUMN "created_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "reef" ALTER COLUMN "updated_at" SET DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX "IDX_4dd2eeb5079abc8e070e991528" ON "reef" USING GiST ("polygon") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_4dd2eeb5079abc8e070e991528"`);
        await queryRunner.query(`ALTER TABLE "reef" ALTER COLUMN "updated_at" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "reef" ALTER COLUMN "created_at" DROP DEFAULT`);
        await queryRunner.query(`CREATE INDEX "IDX_4dd2eeb5079abc8e070e991528" ON "reef" ("polygon") `);
    }

}
