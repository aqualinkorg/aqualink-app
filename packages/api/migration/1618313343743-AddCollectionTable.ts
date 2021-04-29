import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCollectionTable1618313343743 implements MigrationInterface {
  name = 'AddCollectionTable1618313343743';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "collection" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "is_public" boolean NOT NULL DEFAULT false,
        "user_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ad3f485bbc99d875491f44d7c85" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection" ADD CONSTRAINT "FK_4f925485b013b52e32f43d430f6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "collection_reefs_reef" (
        "collection_id" integer NOT NULL,
        "reef_id" integer NOT NULL,
        CONSTRAINT "PK_398f4a78a617c948773401cbfc9" PRIMARY KEY ("collection_id", "reef_id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f6cedba5f7ed68f9e67f525905" ON "collection_reefs_reef" ("collection_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e897d8d19dc532bc8c33dc70b5" ON "collection_reefs_reef" ("reef_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "collection_reefs_reef" ADD CONSTRAINT "FK_f6cedba5f7ed68f9e67f525905e" FOREIGN KEY ("collection_id") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection_reefs_reef" ADD CONSTRAINT "FK_e897d8d19dc532bc8c33dc70b52" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "collection_reefs_reef"`);
    await queryRunner.query(`DROP TABLE "collection"`);
  }
}
