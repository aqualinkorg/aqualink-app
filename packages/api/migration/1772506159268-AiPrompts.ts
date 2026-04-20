import { MigrationInterface, QueryRunner } from 'typeorm';

export class AiPrompts1709856000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ai_prompts table
    await queryRunner.query(`
      CREATE TABLE ai_prompts (
        id SERIAL PRIMARY KEY,
        prompt_key VARCHAR(255) NOT NULL UNIQUE,
        content TEXT NOT NULL,
        description TEXT,
        category VARCHAR(100),
        version INTEGER NOT NULL DEFAULT 1,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        updated_by INTEGER,
        CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
        change_notes TEXT
      )
    `);

    // Create ai_prompts_history table
    await queryRunner.query(`
      CREATE TABLE ai_prompts_history (
        id SERIAL PRIMARY KEY,
        prompt_id INTEGER NOT NULL,
        prompt_key VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        version INTEGER NOT NULL,
        changed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        changed_by INTEGER,
        CONSTRAINT fk_changed_by FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
        change_notes TEXT,
        CONSTRAINT fk_prompt FOREIGN KEY (prompt_id) REFERENCES ai_prompts(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX idx_ai_prompts_prompt_key ON ai_prompts(prompt_key)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_ai_prompts_is_active ON ai_prompts(is_active)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_ai_prompts_history_prompt_id ON ai_prompts_history(prompt_id)`,
    );

    // Create trigger to auto-save history on update
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
      CREATE TRIGGER ai_prompts_history_trigger
      BEFORE UPDATE ON ai_prompts
      FOR EACH ROW
      EXECUTE FUNCTION save_ai_prompt_history();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS ai_prompts_history_trigger ON ai_prompts`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS save_ai_prompt_history`);
    await queryRunner.query(`DROP TABLE ai_prompts_history CASCADE`);
    await queryRunner.query(`DROP TABLE ai_prompts CASCADE`);
  }
}
