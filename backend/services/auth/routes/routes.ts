import { FastifyInstance } from "fastify";
import healthRoute  from "./health";
import register from "../controllers/register.controller";

declare module "fastify" {
    interface FastifyInstance {
        jwt: {
            sign(payload: any, options?: any): string;
            verify(token: string, options?: any): any;
        };
        db: {
            query(sql: string, params?: any[]): Promise<any[]>;
            run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }>;
        };
    }
}


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

export async function routes(fastify: FastifyInstance) {
    fastify.get("/health", healthRoute);
    fastify.post("/register", { schema: registerSchema }, register);
}

