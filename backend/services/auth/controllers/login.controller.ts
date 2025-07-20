import { FastifyRequest, FastifyReply } from "fastify";
import { compareSync } from "bcrypt";
import { User, LoginBody, LoginResponse } from "../types/auth.types";

export default async function login(
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply,
): Promise<LoginResponse> {
    const { email, password } = request.body;

    try {
        const userRecords = await request.server.db.query(
            "SELECT id, username, email, password_hash FROM users WHERE email = ?",
            [email],
        );

        if (!userRecords.length || !compareSync(password, userRecords[0].password_hash)) {
            return reply.status(401).send({ error: "Invalid credentials" });
        }

        const user: User = userRecords[0];

        // Generate JWT
        const token = request.server.jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email,
        });

        const response: LoginResponse = {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        };

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return reply.status(500).send({ error: "Login failed" });
    }
}

export const loginSchema = {
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
