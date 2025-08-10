-- 004_recreate_matches_with_default.sql
CREATE TABLE matches_new (
    id TEXT PRIMARY KEY UNIQUE,
    player1Id TEXT NOT NULL,
    player2Id TEXT NOT NULL,
    player1Score NUMBER NOT NULL,
    player2Score NUMBER NOT NULL,
    gameMode TEXT NOT NULL,
    duration NUMBER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO matches_new SELECT * FROM matches;
DROP TABLE matches;
ALTER TABLE matches_new RENAME TO matches;
