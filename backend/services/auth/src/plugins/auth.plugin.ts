import fp from "fastify-plugin";
import { FastifyRequest, FastifyReply, FastifyPluginOptions } from "fastify";

export interface AuthPluginOptions extends FastifyPluginOptions {
  jwtSecret: string;
}

export default fp(async (fastify, opts: AuthPluginOptions) => {
  const { jwtSecret } = opts;

  fastify.register(require("@fastify/jwt"), {
    secret: jwtSecret,
  });

  fastify.decorate("jwtAuth", async function (
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ message: "Unauthorized" });
    }
  });

  fastify.log.info("✅ JWT plugin initialized with secret from server");
});
