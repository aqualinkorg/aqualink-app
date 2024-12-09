import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReefCheckData1731505574037 implements MigrationInterface {
  name = 'AddReefCheckData1731505574037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "reef_check_site" ("id" character varying NOT NULL, "site_id" integer NOT NULL, "reef_name" character varying, "orientation" character varying, "country" character varying, "state_province_island" character varying, "city_town" character varying, "region" character varying, "distance_from_shore" double precision, "distance_from_nearest_river" double precision, "distance_to_nearest_popn" double precision, CONSTRAINT "REL_228715834910cd57948e2d2dbd" UNIQUE ("site_id"), CONSTRAINT "PK_aeaf0fabffa46cfae6ae194864a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_228715834910cd57948e2d2dbd" ON "reef_check_site" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "reef_check_organism" ("id" SERIAL NOT NULL, "survey_id" character varying NOT NULL, "date" TIMESTAMP NOT NULL, "organism" character varying NOT NULL, "type" character varying NOT NULL, "s1" integer NOT NULL, "s2" integer NOT NULL, "s3" integer NOT NULL, "s4" integer NOT NULL, "recorded_by" character varying, "errors" character varying, CONSTRAINT "PK_4d7d6080278505518ae5ec6cc6d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reef_check_survey" ("id" character varying NOT NULL, "site_id" integer NOT NULL, "reef_check_site_id" character varying NOT NULL, "date" TIMESTAMP, "errors" character varying, "depth" double precision, "time_of_day_work_began" character varying, "time_of_day_work_ended" character varying, "method_used_to_determine_location" character varying, "river_mouth_width" character varying, "weather" character varying, "air_temp" double precision NOT NULL, "water_temp_at_surface" double precision NOT NULL, "water_temp_at3_m" double precision NOT NULL, "water_temp_at10_m" double precision NOT NULL, "approx_popn_size_x1000" double precision NOT NULL, "horizontal_visibility_in_water" double precision NOT NULL, "best_reef_area" character varying, "why_was_this_site_selected" character varying, "sheltered_or_exposed" character varying, "any_major_storms_in_last_years" character varying, "when_storms" character varying, "overall_anthro_impact" character varying, "what_kind_of_impacts" character varying, "siltation" character varying, "dynamite_fishing" character varying, "poison_fishing" character varying, "aquarium_fish_collection" character varying, "harvest_of_inverts_for_food" character varying, "harvest_of_inverts_for_curio" character varying, "tourist_diving_snorkeling" character varying, "sewage_pollution" character varying, "industrial_pollution" character varying, "commercial_fishing" character varying, "live_food_fishing" character varying, "artisinal_recreational" character varying, "other_forms_of_fishing" character varying, "other_fishing" character varying, "yachts" character varying, "level_of_other_impacts" character varying, "other_impacts" character varying, "is_site_protected" character varying, "is_protection_enforced" character varying, "level_of_poaching" character varying, "spearfishing" character varying, "banned_commercial_fishing" character varying, "recreational_fishing" character varying, "invertebrate_shell_collection" character varying, "anchoring" character varying, "diving" character varying, "other_specify" character varying, "nature_of_protection" character varying, "site_comments" character varying, "substrate_comments" character varying, "fish_comments" character varying, "inverts_comments" character varying, "comments_from_organism_sheet" character varying, "grouper_size" character varying, "percent_bleaching" character varying, "percent_colonies_bleached" character varying, "percent_of_each_colony" character varying, "suspected_disease" character varying, "rare_animals_details" character varying, "submitted_by" character varying, CONSTRAINT "PK_03c9040735ab24413d06fa712d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_95fa2c48153ed166716efe3c23" ON "reef_check_survey" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_76957dc5cc44f8ac4aac53323f" ON "reef_check_survey" ("reef_check_site_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "reef_check_substrate" ("id" SERIAL NOT NULL, "survey_id" character varying NOT NULL, "date" TIMESTAMP NOT NULL, "substrate_code" character varying NOT NULL, "s1" integer NOT NULL, "s2" integer NOT NULL, "s3" integer NOT NULL, "s4" integer NOT NULL, "recorded_by" character varying, "errors" character varying, CONSTRAINT "PK_92e3ffa57ceea62932bbd8ab756" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_check_site" ADD CONSTRAINT "FK_228715834910cd57948e2d2dbd6" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_check_organism" ADD CONSTRAINT "FK_d44cfc7847e4a645262d4d17009" FOREIGN KEY ("survey_id") REFERENCES "reef_check_survey"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_check_survey" ADD CONSTRAINT "FK_95fa2c48153ed166716efe3c232" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_check_survey" ADD CONSTRAINT "FK_76957dc5cc44f8ac4aac53323f3" FOREIGN KEY ("reef_check_site_id") REFERENCES "reef_check_site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_check_substrate" ADD CONSTRAINT "FK_81130cf898971ab45fea245e679" FOREIGN KEY ("survey_id") REFERENCES "reef_check_survey"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reef_check_substrate" DROP CONSTRAINT "FK_81130cf898971ab45fea245e679"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_check_survey" DROP CONSTRAINT "FK_76957dc5cc44f8ac4aac53323f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_check_survey" DROP CONSTRAINT "FK_95fa2c48153ed166716efe3c232"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_check_organism" DROP CONSTRAINT "FK_d44cfc7847e4a645262d4d17009"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef_check_site" DROP CONSTRAINT "FK_228715834910cd57948e2d2dbd6"`,
    );
    await queryRunner.query(`DROP TABLE "reef_check_substrate"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_76957dc5cc44f8ac4aac53323f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_95fa2c48153ed166716efe3c23"`,
    );
    await queryRunner.query(`DROP TABLE "reef_check_survey"`);
    await queryRunner.query(`DROP TABLE "reef_check_organism"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_228715834910cd57948e2d2dbd"`,
    );
    await queryRunner.query(`DROP TABLE "reef_check_site"`);
  }
}
