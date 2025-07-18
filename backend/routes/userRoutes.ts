import { FastifyInstance } from "fastify";
import { getUser, createUser, deleteUser } from "../controllers/user.controller";

const createUserSchema = {
    body: {
        type: "object",
        properties: {
            username: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            avatar: { type: "string", format: "uri" },
        },
        required: ["username", "email", "avatar"],
        additionalProperties: false,
    },
    response: {
        201: {
            type: "object",
            properties: {
                id: { type: "number" },
                username: { type: "string" },
                email: { type: "string" },
                avatar: { type: "string" },
            },
        },
    },
} as const;

export async function userRoutes(app: FastifyInstance) {
    // User routes
    app.get("/:id", getUser); // GET /api/user/24 - public
    app.post("/", { schema: createUserSchema }, createUser); // test for username present or not - needs to private
    // app.update("/:id", { schema: updateUserSchema }, updateUser ); // only be done with JWT authentication - public
    app.delete("/:id", deleteUser); // only be done with JWT authentication - public
    app.log.info("user routes registered");
}
