CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    player1Id TEXT UNIQUE NOT NULL,
    player2Id TEXT UNIQUE NOT NULL,
    player1Score NUMBER NOT NULL,
    player2Score NUMBER NOT NULL,
    gameMode TEXT NOT NULL,
    duration NUMBER
);
