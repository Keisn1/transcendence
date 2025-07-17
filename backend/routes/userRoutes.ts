import { FastifyInstance } from "fastify";
import { getUser, createUser, CreateUserBody, CreateUserResponse } from "../controllers/user.controller";
import { createUserSchema } from "./user.schemas";

export async function userRoutes(app: FastifyInstance) {
    // User routes
    app.get("/:id", getUser);
    app.post("/", { schema: createUserSchema }, createUser);

    app.log.info("user routes registered");
}
