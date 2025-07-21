import { FastifyRequest, FastifyReply } from "fastify";
import { genSaltSync, hashSync } from "bcrypt";
import { RegisterBody, RegisterResponse } from "../types/auth.types";

export default async function register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply,
): Promise<RegisterResponse> {
    const { username, email, password } = request.body;

    try {
        // Hash password (stays in auth service)
        const salt = genSaltSync(10);
        const passwordHash = hashSync(password, salt);

        // Store only user_id and password_hash in auth service
        const result = await request.server.db.run(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            [username, email, passwordHash],
        );

        const userId = result.lastID;

        // Generate JWT
        const token = request.server.jwt.sign({
            id: userId,
            username: username,
            email: email,
        });

        const response: RegisterResponse = {
            token,
            user: {
                id: String(userId),
                username: username,
                email: email,
            },
        };

        return response;
    } catch (err) {
        const error = err as Error;
        console.error("Registration error:", error);
        if (error.message.includes("User service")) {
            return reply.status(502).send({ error: "External service unavailable" });
        }
        if (error.message.includes("UNIQUE constraint")) {
            return reply.status(409).send({ error: "User already exists" });
        }
        return reply.status(500).send({ error: "Registration failed" });
    }
}

export const registerSchema = {
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
