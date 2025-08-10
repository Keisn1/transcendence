-- Add column without default first
ALTER TABLE matches ADD COLUMN created_at DATETIME;

-- Update existing rows with current timestamp
UPDATE matches SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
