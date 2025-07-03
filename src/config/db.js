import fp from 'fastify-plugin';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export default fp(async (fastify) => {
	const dbPath = process.env.DB_PATH || path.join('data', 'dev.sqlite');

	const dir = path.dirname(dbPath);
	fs.mkdirSync(dir, { recursive: true });

	const db = new Database(dbPath);

	db.exec(`
	CREATE TABLE IF NOT EXISTS scores (
		id      INTEGER PRIMARY KEY AUTOINCREMENT,
		player  TEXT    NOT NULL UNIQUE,
		score   INTEGER NOT NULL,
		played  DATETIME DEFAULT CURRENT_TIMESTAMP
	)
	`);

	fastify.decorate('db', db);

	fastify.addHook('onClose', (instance, done) => {
	db.close();
	done();
	});
});