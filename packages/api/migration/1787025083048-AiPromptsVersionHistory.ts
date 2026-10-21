import { MigrationInterface, QueryRunner } from 'typeorm';

export class AiPromptsVersionHistory1787025083048 implements MigrationInterface {
  name = 'AiPromptsVersionHistory1787025083048';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add column to track when the CURRENT version actually started being current
    // (separate from updated_at, which the history trigger was incorrectly relying on)
    await queryRunner.query(`
      ALTER TABLE ai_prompts
      ADD COLUMN version_created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
    `);

    // Best-effort backfill for existing rows: use updated_at as an approximation,
    // since we don't have true historical data for when each current version started
    await queryRunner.query(`
      UPDATE ai_prompts
      SET version_created_at = updated_at
    `);

    // Replace the trigger function:
    // 1. History rows now store the ACCURATE creation time (OLD.version_created_at)
    //    instead of implicitly using now() via changed_at's default
    // 2. When content changes, NEW.version_created_at is reset to now(),
    //    marking the start of the new version's lifetime
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION save_ai_prompt_history()
      RETURNS TRIGGER AS $$
      BEGIN
        IF (TG_OP = 'UPDATE' AND OLD.content != NEW.content) THEN
          INSERT INTO ai_prompts_history (
            prompt_id,
            prompt_key,
            content,
            version,
            changed_at,
            changed_by,
            change_notes
          ) VALUES (
            OLD.id,
            OLD.prompt_key,
            OLD.content,
            OLD.version,
            OLD.version_created_at,
            OLD.updated_by,
            OLD.change_notes
          );
          NEW.version_created_at := now();
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore original trigger function (using now() implicitly via changed_at default)
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION save_ai_prompt_history()
      RETURNS TRIGGER AS $$
      BEGIN
        IF (TG_OP = 'UPDATE' AND OLD.content != NEW.content) THEN
          INSERT INTO ai_prompts_history (
            prompt_id,
            prompt_key,
            content,
            version,
            changed_by,
            change_notes
          ) VALUES (
            OLD.id,
            OLD.prompt_key,
            OLD.content,
            OLD.version,
            OLD.updated_by,
            OLD.change_notes
          );
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      ALTER TABLE ai_prompts
      DROP COLUMN version_created_at
    `);
  }
}
