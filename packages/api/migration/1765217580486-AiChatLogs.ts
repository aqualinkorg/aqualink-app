import { MigrationInterface, QueryRunner } from 'typeorm';

export class AiChatLogs1765217580486 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE ai_chat_logs (
                id SERIAL PRIMARY KEY,
                site_id INTEGER NOT NULL,
                user_message TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                user_id INTEGER NULL,
                created_at timestamp without time zone NOT NULL DEFAULT now(),
                CONSTRAINT fk_site FOREIGN KEY (site_id) REFERENCES site(id) ON DELETE CASCADE,
                CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

    await queryRunner.query(
      `CREATE INDEX idx_ai_chat_logs_site_id ON ai_chat_logs(site_id)`,
    );

    await queryRunner.query(
      `CREATE INDEX idx_ai_chat_logs_created_at ON ai_chat_logs(created_at)`,
    );

    await queryRunner.query(
      `CREATE INDEX idx_ai_chat_logs_user_id ON ai_chat_logs(user_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE ai_chat_logs CASCADE`);
  }
}
