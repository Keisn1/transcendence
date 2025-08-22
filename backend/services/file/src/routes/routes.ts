import { FastifyInstance } from "fastify";
import uploadAvatar from "../controllers/upload.controller";
import deleteAvatar from "../controllers/delete.controller";

export async function routes(fastify: FastifyInstance) {
    fastify.register(
        (fastify: FastifyInstance) => {
            fastify.post("/upload/avatar", uploadAvatar);
            fastify.get("/health", () => ({ status: "ok" }));
        },
        { prefix: "file" },
    );

    fastify.register(
        (fastify: FastifyInstance) => {
            fastify.delete<{ Params: { filename: string } }>(
                "/avatar/:filename",
                { preHandler: fastify.jwtAuth },
                deleteAvatar,
            );
        },
        { prefix: "internal" },
    );
}
