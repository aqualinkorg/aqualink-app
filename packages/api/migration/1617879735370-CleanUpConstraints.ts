import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanUpConstraints1617879735370 implements MigrationInterface {
  name = 'CleanUpConstraints1617879735370';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reef_point_of_interest" DROP CONSTRAINT "FK_4a2bdb6a3cff9c746be703224dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_point_of_interest" ALTER COLUMN "reef_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_point_of_interest" ADD CONSTRAINT "FK_4a2bdb6a3cff9c746be703224dc" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "survey" DROP CONSTRAINT "FK_a37da0d039df5145bd187a32e09"`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" DROP CONSTRAINT "FK_ac7705ae80042c05f5582938c8a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" ALTER COLUMN "weather_conditions" SET DEFAULT 'no-data'`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" ALTER COLUMN "user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" ALTER COLUMN "reef_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" ADD CONSTRAINT "FK_a37da0d039df5145bd187a32e09" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" ADD CONSTRAINT "FK_ac7705ae80042c05f5582938c8a" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "FK_88a659ad442c11d3a5400b3def4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_reef_data"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_data"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "reef_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_reef_data" UNIQUE ("timestamp", "reef_id", "metric", "source_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_data" UNIQUE ("timestamp", "reef_id", "poi_id", "metric", "source_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_88a659ad442c11d3a5400b3def4" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "FK_88a659ad442c11d3a5400b3def4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_data"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_reef_data"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "reef_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_data" UNIQUE ("timestamp", "reef_id", "poi_id", "metric", "source_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_reef_data" UNIQUE ("timestamp", "reef_id", "metric", "source_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_88a659ad442c11d3a5400b3def4" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "survey" DROP CONSTRAINT "FK_ac7705ae80042c05f5582938c8a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" DROP CONSTRAINT "FK_a37da0d039df5145bd187a32e09"`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" ALTER COLUMN "reef_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" ALTER COLUMN "user_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" ALTER COLUMN "weather_conditions" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" ADD CONSTRAINT "FK_ac7705ae80042c05f5582938c8a" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" ADD CONSTRAINT "FK_a37da0d039df5145bd187a32e09" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "reef_point_of_interest" DROP CONSTRAINT "FK_4a2bdb6a3cff9c746be703224dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_point_of_interest" ALTER COLUMN "reef_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_point_of_interest" ADD CONSTRAINT "FK_4a2bdb6a3cff9c746be703224dc" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
