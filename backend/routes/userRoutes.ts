import { FastifyInstance } from "fastify";
import { getUser, createUser } from "../controllers/user.controller";

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
    app.get("/:id", getUser);
    app.post("/", { schema: createUserSchema }, createUser);
    app.log.info("user routes registered");
}
