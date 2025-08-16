-- Add to migrations: 009_create_friendships.sql
CREATE TABLE friendships (
    id TEXT PRIMARY KEY,
    requester_id TEXT NOT NULL,
    addressee_id TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (addressee_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(requester_id, addressee_id)
);

-- Add online status tracking
ALTER TABLE users ADD COLUMN last_seen DATETIME;
ALTER TABLE users ADD COLUMN is_online INTEGER DEFAULT 0;
