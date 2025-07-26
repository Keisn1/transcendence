import fp from "fastify-plugin";
import { FastifyRequest, FastifyReply } from "fastify";

// resource: https://www.youtube.com/watch?v=FVJYlRvQom8

export interface AuthPluginOptions {
    jwtSecret: string;
}

export default fp<AuthPluginOptions>(async (fastify, opts: AuthPluginOptions) => {
    const { jwtSecret } = opts;

    fastify.register(require("@fastify/jwt"), {
        secret: jwtSecret,
    });

    fastify.decorate("jwtAuth", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.status(401).send({ message: "Unauthorized" });
        }
    });

    fastify.log.info("✅ JWT plugin initialized with secret from server");
});
