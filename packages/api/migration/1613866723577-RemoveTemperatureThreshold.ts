import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTemperatureThreshold1613866723577 implements MigrationInterface {
  name = 'RemoveTemperatureThreshold1613866723577';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reef" DROP COLUMN "temperature_threshold"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reef" ADD "temperature_threshold" double precision`,
    );
  }
}
