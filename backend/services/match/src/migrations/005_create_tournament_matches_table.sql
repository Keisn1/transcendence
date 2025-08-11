-- 005_create_tournament_matches_table.sql
CREATE TABLE tournament_matches (
    tournament_id TEXT NOT NULL,
    match_id TEXT NOT NULL,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (match_id) REFERENCES matches(id)
);
