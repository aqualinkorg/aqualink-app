import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOpenMeteoSourceType1783013965319 implements MigrationInterface {
  name = 'AddOpenMeteoSourceType1783013965319';

  transaction = false as const;

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'open_meteo' to every enum type that already contains
    // 'sofar_model'. Existing rows are intentionally left untouched —
    // their `source` will only change to 'open_meteo' once the ingestion
    // pipeline actually re-fetches that site's data from Open-Meteo,
    // keeping the label always accurate to the underlying value.
    await queryRunner.query(`
      DO $$
      DECLARE
          enum_type RECORD;
      BEGIN
          FOR enum_type IN
              SELECT DISTINCT t.typname
              FROM pg_type t
              JOIN pg_enum e ON e.enumtypid = t.oid
              WHERE e.enumlabel = 'sofar_model'
          LOOP
              EXECUTE format(
                'ALTER TYPE %I ADD VALUE IF NOT EXISTS %L',
                enum_type.typname, 'open_meteo'
              );
          END LOOP;
      END $$;
    `);
  }

  public async down(): Promise<void> {
    // PostgreSQL does not allow removing a value from an enum type
    // without recreating it, which requires temporarily detaching all
    // referencing columns. Not handled here — the 'open_meteo' value is
    // left in place but unused on rollback.
  }
}
