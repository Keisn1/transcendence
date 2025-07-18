import { FastifyInstance } from "fastify";
import { getUser, createUser } from "../controllers/user.controller";
import { ping, profile } from "../controllers/root.controller";

export async function routes(app: FastifyInstance) {
    // Stupid routes
    app.get("/ping", ping);
    app.get("/profile", profile);
}
