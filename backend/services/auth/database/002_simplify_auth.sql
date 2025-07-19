CREATE TABLE IF NOT EXISTS auth_credentials (
    user_id INTEGER PRIMARY KEY,  -- References user service ID
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Drop the old users table
DROP TABLE IF EXISTS users;
