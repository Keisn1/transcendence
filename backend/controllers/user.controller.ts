import { FastifyReply } from "fastify";
import { FastifyRequest } from "fastify";
import { User } from "../models/User";

type CreateUserBody = {
    username: string;
    email: string;
    avatar: string;
};

var userDb: Record<number, User> = {
    123: {
        id: 123,
        username: "john_doe",
        email: "john@example.com",
        avatar: "https://example.com/avatar.jpg",
    },
    124: {
        id: 124,
        username: "jane_doe",
        email: "jane@example.com",
        avatar: "https://example.com/avatar.jpg",
    },
};

export async function getUser(
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply,
) {
    let userId = request.params.id;

    if (!(userId in userDb)) {
        return reply.code(404).send({ error: "User not found" });
    }
    return userDb[userId];
}

export async function createUser(
    request: FastifyRequest<{ Body: CreateUserBody }>,
    reply: FastifyReply,
) {
    let newUserData = request.body;

    if (newUserData.username in userDb) {
        return reply
            .code(400)
            .send({ error: "Username is already being used" });
    }

    const keys = Object.keys(userDb);
    const lastKey = keys[keys.length - 1];
    const newUserId: number = +lastKey + 1;

    let newUser: User;
    newUser = {
        id: newUserId,
        username: newUserData.username,
        email: newUserData.email,
        avatar: newUserData.avatar,
    };

    userDb[newUserId] = newUser;
}
