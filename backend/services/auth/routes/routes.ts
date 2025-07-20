import { FastifyInstance } from "fastify";
import healthRoute from "./health";
import register from "../controllers/register.controller";
import login from "../controllers/login.controller";

const registerSchema = {
    body: {
        type: "object",
        properties: {
            username: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
        },
        required: ["username", "email", "password"],
        additionalProperties: false,
    },
    response: {
        201: {
            type: "object",
            properties: {
                token: { type: "string" }, // Added token
                user: {
                    type: "object",
                    properties: {
                        id: { type: "number" },
                        username: { type: "string" },
                        email: { type: "string" },
                    },
                },
            },
        },
    },
} as const;

const loginSchema = {
    body: {
        type: "object",
        properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1 },
        },
        required: ["email", "password"],
        additionalProperties: false,
    },
    response: {
        200: {
            type: "object",
            properties: {
                token: { type: "string" },
                user: {
                    type: "object",
                    properties: {
                        id: { type: "number" },
                        username: { type: "string" },
                        email: { type: "string" },
                    },
                },
            },
        },
    },
} as const;

export async function routes(fastify: FastifyInstance) {
    fastify.get("/health", healthRoute);
    fastify.post("/register", { schema: registerSchema }, register);
    fastify.post("/login", { schema: loginSchema }, login);
}
