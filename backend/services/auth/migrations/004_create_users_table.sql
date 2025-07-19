CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migrate any existing data from auth_credentials to users
INSERT INTO users (id, email, password_hash, created_at, updated_at)
SELECT user_id, email, password_hash, created_at, updated_at
FROM auth_credentials
WHERE email IS NOT NULL;

-- Drop old table
DROP TABLE auth_credentials;
