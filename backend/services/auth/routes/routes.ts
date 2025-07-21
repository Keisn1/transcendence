import { FastifyInstance } from "fastify";
import healthRoute from "./health";
import login, { loginSchema } from "../controllers/login.controller";
import register, { registerSchema } from "../controllers/register.controller";
import update, { updateUserSchema } from "../controllers/update.controller";

export async function routes(fastify: FastifyInstance) {
    fastify.get("/health", healthRoute);
    fastify.post("/signup", { schema: registerSchema }, register); // incorporates user creation
    fastify.post("/login", { schema: loginSchema }, login);
    fastify.put("", { schema: updateUserSchema }, update); // updates user; might be straightforward
}
