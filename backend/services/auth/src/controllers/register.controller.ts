import { FastifyRequest, FastifyReply } from "fastify";
import { genSaltSync, hashSync } from "bcrypt";
import { RegisterBody, RegisterResponse, User } from "../types/auth.types";
import { v4 as uuidv4 } from "uuid";

export async function register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply,
): Promise<RegisterResponse> {
    let { username, email, password } = request.body;

    username = username.toLowerCase();

    try {
        // Hash password (stays in auth service)
        const salt = genSaltSync(10);
        const passwordHash = hashSync(password, salt);

        const userId = uuidv4();
        // Store only user_id and password_hash in auth service
        await request.server.db.run(
            "INSERT INTO users (id, username, email, password_hash, avatar) VALUES (?, ?, ?, ?, ?)",
            [userId, username, email, passwordHash, "/uploads/default-pfp.png"],
        );

        const user: User = {
            id: userId, // Use generated UUID instead of result.lastID
            username: username,
            avatar: "/uploads/default-pfp.png",
            twoFaEnabled: false,
        };

        // Generate JWT
        const token = request.server.jwt.sign(user, { expiresIn: "1h" });
        const response: RegisterResponse = {
            token,
            user,
        };
        return reply.status(201).send(response);
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
                        id: { type: "string" },
                        username: { type: "string" },
                        avatar: { type: "string", format: "uri-reference" },
                        twoFaEnabled: { type: "boolean" },
                    },
                    required: ["id", "username", "avatar"],
                },
            },
            additionalProperties: false,
        },
    },
} as const;
