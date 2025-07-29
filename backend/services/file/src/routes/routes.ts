import { FastifyInstance } from "fastify";
import uploadAvatar from "../controllers/upload.controller";

export async function routes(fastify: FastifyInstance) {
    fastify.register(
        (fastify: FastifyInstance) => {
            fastify.post("/upload/avatar", uploadAvatar);
            fastify.get("/health", () => ({ status: "ok" }));
        },
        { prefix: "file" },
    );
}
