-- Create new table with UUID primary key
CREATE TABLE users_new (
    id TEXT PRIMARY KEY,  -- UUID as string
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT NOT NULL,
    twofa_secret TEXT,
    twofa_enabled BOOLEAN,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Note: You'll lose existing users, but for dev that's probably fine
-- If you need to preserve data, you'd generate UUIDs for existing records

DROP TABLE users;
ALTER TABLE users_new RENAME TO users;
