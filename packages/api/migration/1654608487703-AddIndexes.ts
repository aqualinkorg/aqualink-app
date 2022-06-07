import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1654608487703 implements MigrationInterface {
  name = 'AddIndexes1654608487703';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_5ae17cee9e339b189cf3e220e5" ON "site_audit" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4f925485b013b52e32f43d430f" ON "collection" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ed4a7be821c5819d382e4b72e" ON "data_uploads" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a0eaf4da731fb39079b1fbf9fb" ON "data_uploads" ("survey_point_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2547f55866c0274d35fdd9a29c" ON "region" ("parent_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dcc651c79d9b16e5a159ad4ded" ON "site_application" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_37fc9d09ff7c17d2338203829b" ON "site_application" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f7e22a9fea6ffe85ee8249bdc" ON "sketch_fab" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a77a30409a2905313e11d7685d" ON "site_survey_point" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a513eb5b403b175938dce4bf3" ON "daily_data" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2e5de2284644a41979436d3820" ON "historical_monthly_mean" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff7a13fae129f15180a3e36f9e" ON "site" ("region_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d56028954ec00388e734fb266" ON "site" ("stream_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_687c94fe33408bad80672846e1" ON "survey_media" ("survey_point_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a37da0d039df5145bd187a32e0" ON "survey" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5ee3e3571f59efef147b4e6b1f" ON "survey" ("site_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5ee3e3571f59efef147b4e6b1f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a37da0d039df5145bd187a32e0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_687c94fe33408bad80672846e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2d56028954ec00388e734fb266"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff7a13fae129f15180a3e36f9e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2e5de2284644a41979436d3820"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9a513eb5b403b175938dce4bf3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a77a30409a2905313e11d7685d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f7e22a9fea6ffe85ee8249bdc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_37fc9d09ff7c17d2338203829b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dcc651c79d9b16e5a159ad4ded"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2547f55866c0274d35fdd9a29c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a0eaf4da731fb39079b1fbf9fb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ed4a7be821c5819d382e4b72e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4f925485b013b52e32f43d430f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5ae17cee9e339b189cf3e220e5"`,
    );
  }
}
