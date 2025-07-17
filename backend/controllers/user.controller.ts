import { FastifyRequest, FastifyReply, RouteHandler } from "fastify";
import { User } from "../models/User";
import {} from "fastify";

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
    reply: FastifyReply,
): Promise<CreateUserResponse> {
    let newUserData = request.body;

    console.log(newUserData.username);

    for (const user of Object.values(userDb)) {
        if (user.username === newUserData.username) {
            return reply.code(400).send({ error: "Username is already being used" });
        }
    }
    // if (newUserData.username in userDb) {
    //     return reply.code(400).send({ error: "Username is already being used" });
    // }

    const keys = Object.keys(userDb);
    const lastKey = keys[keys.length - 1];
    const newUserId: number = +lastKey + 1;

    let newUser: CreateUserResponse;
    newUser = {
        id: newUserId,
        username: newUserData.username,
        email: newUserData.email,
        avatar: newUserData.avatar,
    };

    userDb[newUserId] = newUser;
    console.log(newUser);
    return newUser;
}

export async function getUser(request: FastifyRequest<{ Params: { id: number } }>, reply: FastifyReply) {
    let userId = request.params.id;

    if (!(userId in userDb)) {
        return reply.code(404).send({ error: "User not found" });
    }
    return userDb[userId];
}
