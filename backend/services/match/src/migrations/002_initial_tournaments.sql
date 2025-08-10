-- tournaments table
CREATE TABLE tournaments (
    id TEXT PRIMARY KEY,
    name TEXT,
    player_count INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- tournament_participants table
CREATE TABLE tournament_participants (
    tournament_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    PRIMARY KEY (tournament_id, player_id)
);
