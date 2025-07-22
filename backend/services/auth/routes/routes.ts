import { FastifyInstance } from "fastify";
import healthRoute from "./health";
import login, { loginSchema } from "../controllers/login.controller";
import register, { registerSchema } from "../controllers/register.controller";
import update, { updateUserSchema } from "../controllers/update.controller";
import getProfile, { getCurrentUserSchema } from "../controllers/getProfile.controller";

export async function routes(fastify: FastifyInstance) {
    fastify.get("/health", healthRoute);
    fastify.post("/signup", { schema: registerSchema }, register); // incorporates user creation
    fastify.post("/login", { schema: loginSchema }, login);
    fastify.patch("/:id", { preHandler: fastify.jwtAuth, schema: updateUserSchema }, update); // maybe patch is more suitable than put
    fastify.get("/me", { preHandler: fastify.jwtAuth, schema: getCurrentUserSchema }, getProfile);
}
