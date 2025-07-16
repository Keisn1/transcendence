import fastify from "fastify";
import { FastifyRequest } from "fastify";

const server = fastify();

server.get("/ping", async (request, reply) => {
    return "pong\n";
});

server.get("/api/profile", async (request, reply) => {
    return "your profile\n";
});

server.get("/login/:user", async (request: FastifyRequest<{ Params: { user: string } }>, reply) => {
    let user = request.params.user;

    let obj1 = {
        id: "123",
        username: "john_doe",
        email: "john@example.com",
        avatar: "https://example.com/avatar.jpg",
    };
    let obj2 = {
        id: "124",
        username: "jane_doe",
        email: "jane@example.com",
        avatar: "https://example.com/avatar.jpg",
    };

    if (user == "john_doe") {
        return JSON.stringify(obj1);
    } else if (user == "jane_doe") {
        return JSON.stringify(obj2);
    }
});

server.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
