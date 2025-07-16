import fastify from "fastify";
import { FastifyRequest } from "fastify";

const server = fastify();

server.get("/ping", async (request, reply) => {
    return "pong\n";
});

server.get("/api/profile", async (request, reply) => {
    return "your profile\n";
});

type User = {
    id: number,
    username: string,
    email: string,
    avatar: string,
}

type CreateUserBody = {
    username: string;
    email: string;
    avatar: string;
}

var userDb: Record< number, User > = {
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
        }
}

server.get("/api/user/:id", async (request: FastifyRequest<{ Params: { id: number } }>, reply) => {
    let userId = request.params.id;    

    if (!(userId in userDb)) {
        return reply.code(404).send({ error: 'User not found' });
    }
    return userDb[userId];
});

server.post("/api/user", async (request: FastifyRequest<{ Body: CreateUserBody }>, reply) => {
    let newUserData = request.body;

    if (newUserData.username in userDb) {
        return reply.code(400).send({ error: 'Username is already being used' });
    }

    const keys = Object.keys(userDb);
    const lastKey = keys[keys.length - 1];
    const newUserId: number = +lastKey + 1;

    let newUser: User;
    newUser = { 
        id: newUserId,
        username: newUserData.username, 
        email: newUserData.email,
        avatar: newUserData.avatar
    };

    userDb[newUserId] = newUser;
})


server.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
