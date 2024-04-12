import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateVideoStream1712916139973 implements MigrationInterface {
  name = 'UpdateVideoStream1712916139973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" DROP CONSTRAINT "FK_2d56028954ec00388e734fb266c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2d56028954ec00388e734fb266"`,
    );
    await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "stream_id"`);
    await queryRunner.query(
      `ALTER TABLE "sketch_fab" DROP CONSTRAINT "FK_6f7e22a9fea6ffe85ee8249bdca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sketch_fab" ADD CONSTRAINT "UQ_6f7e22a9fea6ffe85ee8249bdca" UNIQUE ("site_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sketch_fab" ADD CONSTRAINT "FK_6f7e22a9fea6ffe85ee8249bdca" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query('DROP TABLE public.video_stream');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE public.video_stream (
        id serial4 NOT NULL,
        owner_email varchar NOT NULL,
        url varchar NOT NULL,
        quality int4 DEFAULT 1 NOT NULL,
        important bool NOT NULL,
        hidden bool NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL,
        "location" public.geometry(point, 4326) NULL,
        CONSTRAINT "PK_c8a8fee15d627cfb3b4db140d5b" PRIMARY KEY (id),
        CONSTRAINT "UQ_de4eb243bae87587f9ca56ba8d2" UNIQUE (location)
      )`,
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_de4eb243bae87587f9ca56ba8d" ON public.video_stream USING gist (location)',
    );
    await queryRunner.query(
      `ALTER TABLE "sketch_fab" DROP CONSTRAINT "FK_6f7e22a9fea6ffe85ee8249bdca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sketch_fab" DROP CONSTRAINT "UQ_6f7e22a9fea6ffe85ee8249bdca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sketch_fab" ADD CONSTRAINT "FK_6f7e22a9fea6ffe85ee8249bdca" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "site" ADD "stream_id" integer`);
    await queryRunner.query(
      `CREATE INDEX "IDX_2d56028954ec00388e734fb266" ON "site" ("stream_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ADD CONSTRAINT "FK_2d56028954ec00388e734fb266c" FOREIGN KEY ("stream_id") REFERENCES "video_stream"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
