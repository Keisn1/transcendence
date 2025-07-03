import fp from 'fastify-plugin';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export default fp(async (fastify) => {
	const dbPath = process.env.DB_PATH || path.join('data', 'dev.sqlite');

	const dir = path.dirname(dbPath);
	fs.mkdirSync(dir, { recursive: true });

	const db = new Database(dbPath);

	// users table
	db.exec(`
		CREATE TABLE users (
			id			INTEGER	PRIMARY	KEY AUTOINCREMENT,
			name		TEXT	NOT NULL,
			username	TEXT	NOT NULL UNIQUE,
			email		TEXT	NOT NULL UNIQUE,
			joined		DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`);

	// scores table that references the user
	db.exec(`
		CREATE TABLE scores (
			id		INTEGER	PRIMARY KEY AUTOINCREMENT,
			user_id	INTEGER	NOT NULL REFERENCES users(id),
			score	INTEGER	NOT NULL,
			played	DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`);

	fastify.decorate('db', db);

	fastify.addHook('onClose', (instance, done) => {
	db.close();
	done();
	});
});