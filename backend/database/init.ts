import { db } from './index';

export async function initDatabase() {
	await db.exec(`
	DROP TABLE IF EXISTS users;
	
	CREATE TABLE users (
		id       INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT    UNIQUE NOT NULL,
		email    TEXT    UNIQUE NOT NULL,
		avatar   TEXT
	);
	`);
	await db.run(`
		INSERT INTO users (id, username, email, avatar) VALUES
		(123, 'john_doe', 'john@example.com', 'https://example.com/avatar.jpg'),
		(124, 'jane_doe', 'jane@example.com', 'https://example.com/avatar.jpg');
	`);
}
