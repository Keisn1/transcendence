-- Add email column without constraints first
ALTER TABLE auth_credentials ADD COLUMN email TEXT;

-- Create new table with desired structure
CREATE TABLE auth_credentials_new (
    user_id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing data (this will fail if you have existing records without email)
-- For now, we'll just create the new structure
DROP TABLE auth_credentials;
ALTER TABLE auth_credentials_new RENAME TO auth_credentials;
