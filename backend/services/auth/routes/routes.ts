import { FastifyInstance } from "fastify";
import healthRoute from "./health";
import login, { loginSchema } from "../controllers/login.controller";
import register, { registerSchema } from "../controllers/register.controller";

export async function routes(fastify: FastifyInstance) {
    fastify.get("/health", healthRoute);
    fastify.post("/register", { schema: registerSchema }, register);
    fastify.post("/login", { schema: loginSchema }, login);
}
