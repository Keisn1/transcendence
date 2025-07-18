import { FastifyRequest, FastifyReply } from "fastify";
import { User } from "../models/User";
import {} from "fastify";
import { db } from '../database';
import sqlite3 , { RunResult } from 'sqlite3';

export interface CreateUserBody {
    username: string;
    email: string;
    avatar: string;
}

export interface CreateUserResponse {
    id: number;
    username: string;
    email: string;
    avatar: string;
}

export async function createUser(
    request: FastifyRequest<{ Body: CreateUserBody }>,
    reply: FastifyReply) {
    const { username, email, avatar } = request.body;

    const selectStmt = db.prepare('SELECT * FROM users WHERE username = ?');
    selectStmt.get(
        username,
        (err: Error | null, existingUserRow?: CreateUserResponse) => {

            if (err) {
                request.log.error(err);
                return reply.code(500).send({ error: 'Database error on SELECT' });
            }

            if (existingUserRow) {
                return reply.code(400).send({ message: 'Username is already in use.'});
            }

            const insertStmt = db.prepare(
                'INSERT INTO users (username, email, avatar) VALUES (?, ?, ?)'
            );

            insertStmt.run(
                username,
                email,
                avatar,
                function (this: RunResult, err: Error | null) {
                    if (err) {
                        if (err.message.includes('INIQUE constraint failed')) {
                            return reply.code(400).send({ message: 'Username or email already in use.'});
                        }
                        request.log.error(err);
                        return reply.code(500).send({ error: 'Database error on INSERT' });
                    }

                    const newId = this.lastID as number;

                    const fetchStmt = db.prepare('SELECT * FROM users WHERE id = ?');
                    fetchStmt.get(
                        newId,
                        (err: Error | null, newUserRow?: CreateUserResponse) => {
                            if (err) {
                                request.log.error(err);
                                return reply.code(500).send({ error: 'Could not retrieve new user.' });
                            }
                            return reply.code(201).send(newUserRow);
                        }
                    );
                }
            );
        }
    );
}

export function getUser(
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply): void {
    const userId = request.params.id;

    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    stmt.get(
        userId,
        (err: Error | null, row?: CreateUserResponse) => {
        if (err) {
            request.log.error(err);
            return reply
            .code(500)
            .send({ error: 'Database error on SELECT' });
        }

        if (!row) {
            return reply
            .code(404)
            .send({ error: 'User not found' });
        }

        return reply
            .code(200)
            .send(row);
        }
    );
}
