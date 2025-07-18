import { FastifyRequest, FastifyReply } from "fastify";
import { User } from "../models/User";
import {} from "fastify";
import { db } from '../database';
import * as userRepo from '../repositories/user.repository';

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

export async function getUser(
  request: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply) {
    try {
        const user = await userRepo.findUserById(request.params.id);
        if (!user) {
            return reply.code(404).send({ error: 'User not found' });
        }
        return reply.code(200).send(user);
    } catch (err: any) {
        request.log.error(err);
        return reply.code(500).send({ error: 'Internal server error' });
    }
}

export async function createUser(
    request: FastifyRequest<{ Body: CreateUserBody }>,
    reply: FastifyReply) {
    const { username, email, avatar } = request.body;

    try {
        const existing = await userRepo.findUserByUsername(username);
        if (existing) {
            return reply.code(400).send({ message: 'Username is already in use.' });
        }
        const newUser = await userRepo.insertUser({ username, email, avatar });
        return reply.code(201).send(newUser);
    } catch (err: any) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return reply.code(400).send({ message: 'Username or email already in use.' });
        }
        request.log.error(err);
        return reply.code(500).send({ error: 'Internal server error' });
    }
}

export async function deleteUser(
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply
    ) {
    const id = request.params.id;

    if (Number.isNaN(id)) return reply.code(400).send({ error: 'Invalid user id' });

    try {
        const user = await userRepo.deleteUser(id);
        return reply.code(200).send(user);
    } catch (err: any) {
        if (err.message.includes('not found')) {
            return reply.code(404).send({ error: err.message });
        }
        request.log.error(err);
        return reply.code(500).send({ error: 'Internal server error' });
    }
}
