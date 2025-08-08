import { FastifyRequest, FastifyReply } from "fastify";
import { compareSync } from "bcrypt";
import { LoginBody, LoginResponse } from "../types/auth.types";

export default async function login(
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply,
): Promise<LoginResponse> {
    const { email, password } = request.body;

    try {
        const userRecords = await request.server.db.query(
            "SELECT id, username, email, password_hash, avatar, twofa_enabled as twoFaEnabled FROM users WHERE email = ?",
            [email],
        );

        if (!userRecords.length || !compareSync(password, userRecords[0].password_hash)) {
            // NOTE compareSync can be repladed with async compare for non blocking
            return reply.status(401).send({ error: "Invalid credentials" });
        }

        const { password_hash: _, twoFaEnabled, email: __, ...userWithoutPasswordEmail } = userRecords[0];
        const user = {
            ...userWithoutPasswordEmail,
            twoFaEnabled: Boolean(twoFaEnabled), // Convert 0/1 to false/true
        };

        // Generate JWT
        const token = request.server.jwt.sign(user, { expiresIn: "1h" });
        const response: LoginResponse = { token, user };

        // send response
        return reply.status(201).send(response);
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
                        id: { type: "string" },
                        username: { type: "string" },
                        avatar: { type: "string", format: "uri-reference" },
                        twoFaEnabled: { type: "boolean" },
                    },
                    required: ["id", "username", "email", "avatar"],
                },
            },
            additionalProperties: false,
        },
    },
} as const;
