import fp from "fastify-plugin";
import { FastifyRequest, FastifyReply } from "fastify";

export default fp(async (fastify) => {
    fastify.register(require("@fastify/jwt"), {
        secret: process.env.JWT_SECRET,
    });

    fastify.decorate("jwtAuth", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.status(401).send({ message: "Unauthorized" });
        }
    });
});

// resource: https://www.youtube.com/watch?v=FVJYlRvQom8
