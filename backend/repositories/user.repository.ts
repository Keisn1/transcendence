import { db } from '../database';
import { User } from '../models/User';

export async function findUserByUsername(username: string): Promise<User | undefined> {
	return db.get<User>('SELECT * FROM users WHERE username = ?', [username]);
}

export async function findUserById(id: number): Promise<User | undefined> {
	return db.get<User>('SELECT * FROM users WHERE id = ?', [id]);
}

export async function insertUser(data: {
	username: string;
	email: string;
	avatar?: string;
	}): Promise<User> {
	const { username, email, avatar } = data;
	const result = await db.run(`
        INSERT INTO users (username, email, avatar) VALUES 
        (?, ?, ?)
        `,
		[username, email, avatar ?? null]
	);
	return db.get<User>('SELECT * FROM users WHERE id = ?', [result.lastID]) as Promise<User>;
}

export async function deleteUser(id: number): Promise<User> {
	const user = await findUserById(id);
	if (!user) throw new Error(`User with id=${id} not found`);
	await db.run('DELETE FROM users WHERE id = ?', [id]);
	return user;
}
