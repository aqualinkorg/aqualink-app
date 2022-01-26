import {MigrationInterface, QueryRunner} from "typeorm";

export class useDisplayColumnName1643232869514 implements MigrationInterface {
    name = 'useDisplayColumnName1643232869514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site" RENAME COLUMN "approved" TO "display"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site" RENAME COLUMN "display" TO "approved"`);
    }

}
