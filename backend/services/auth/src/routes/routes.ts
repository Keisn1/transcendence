import { FastifyInstance } from "fastify";
import healthRoute from "./health";
import login, { loginSchema } from "../controllers/login.controller";
import register, { registerSchema } from "../controllers/register.controller";
import update, { updateUserSchema } from "../controllers/update.controller";
import getProfile, { getCurrentUserSchema } from "../controllers/getProfile.controller";

export async function routes(fastify: FastifyInstance) {
    fastify.register(
        (fastify: FastifyInstance) => {
            fastify.post("/signup", { schema: registerSchema }, register); // incorporates user creation
            fastify.post("/login", { schema: loginSchema }, login);
            fastify.get("/health", healthRoute);
        },
        { prefix: "auth" },
    );
    fastify.register(
        (fastify: FastifyInstance) => {
            fastify.get("", { preHandler: fastify.jwtAuth, schema: getCurrentUserSchema }, getProfile);
            fastify.put("", { preHandler: fastify.jwtAuth, schema: updateUserSchema }, update);
            fastify.get("/health", healthRoute);
        },
        { prefix: "user" },
    );
}
