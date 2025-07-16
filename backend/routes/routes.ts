import { FastifyInstance } from "fastify";
import { getUser, createUser } from "../controllers/user.controller";
import { ping, profile } from "../controllers/root.controller";

export async function routes(fastify: FastifyInstance) {
    // Stupid routes
    fastify.get("/ping", ping);
    fastify.get("/profile", profile);

    // User routes
    fastify.register(
        async (userRoutes) => {
            userRoutes.get("/:id", getUser);
            userRoutes.post("/", createUser);
        },
        { prefix: "/user" },
    );
}
