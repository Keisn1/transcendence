CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY UNIQUE,
    player1Id TEXT NOT NULL,
    player2Id TEXT NOT NULL,
    player1Score NUMBER NOT NULL,
    player2Score NUMBER NOT NULL,
    gameMode TEXT NOT NULL,
    duration NUMBER
);
