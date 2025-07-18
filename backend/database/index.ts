import sqlite3 from 'sqlite3';
import path from 'path';

const dbFile = path.resolve(__dirname, '../../dev.db');
export const db = new sqlite3.Database(dbFile, (err) => {
	if (err) {
		console.error('Failed to connect to SQLite:', err);
		return;
	}
	console.log('Connected to SQLite:', dbFile);

	db.exec(`
		-- not very nice solution, but fine for now
		DROP TABLE IF EXISTS users;
		
		CREATE TABLE IF NOT EXISTS users (
		id       INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT    UNIQUE NOT NULL,
		email    TEXT    UNIQUE NOT NULL,
		avatar   TEXT
		);

		INSERT INTO users (id, username, email, avatar) VALUES
		(123, 'john_doe', 'john@example.com', 'https://example.com/avatar.jpg'),
		(124, 'jane_doe', 'jane@example.com', 'https://example.com/avatar.jpg');
	`, (err) => {
		if (err) {
		console.error('Failed to initialize schema:', err);
		} else {
		console.log('Database schema created & seeded.');
		}
	});
});
