-- Create AI chat logs table
CREATE TABLE ai_chat_logs (
id SERIAL PRIMARY KEY,
site_id INTEGER NOT NULL,
user_message TEXT NOT NULL,
ai_response TEXT NOT NULL,
user_id INTEGER NULL;
created_at timestamp without time zone NOT NULL DEFAULT now()

    -- Foreign key to sites table
    CONSTRAINT fk_site FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE

);

ALTER TABLE ai_chat_logs
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add index for querying by site
CREATE INDEX idx_ai_chat_logs_site_id ON ai_chat_logs(site_id);

-- Add index for querying by date
CREATE INDEX idx_ai_chat_logs_created_at ON ai_chat_logs(created_at);

-- Add index for querying by user
CREATE INDEX idx_ai_chat_logs_user_id ON ai_chat_logs(user_id);
