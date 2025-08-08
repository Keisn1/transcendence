import { FastifyRequest, FastifyReply } from "fastify";
import { genSaltSync, hashSync } from "bcrypt";
import { UpdateUserBody, UpdateUserResponse, User } from "../types/auth.types";

export default async function update(request: FastifyRequest, reply: FastifyReply): Promise<UpdateUserResponse> {
    const id = request.user.id;
    const { username, email, password, avatar } = request.body as UpdateUserBody;

    const fields: string[] = [];
    const values: any[] = [];

    if (username) {
        fields.push("username = ?");
        values.push(username);
    }
    if (email) {
        fields.push("email = ?");
        values.push(email);
    }
    if (password) {
        const salt = genSaltSync(10);
        const passwordHash = hashSync(password, salt);
        fields.push("password_hash = ?");
        values.push(passwordHash);
    }
    if (avatar) {
        fields.push("avatar = ?");
        values.push(avatar);
    }

    if (fields.length === 0) {
        return reply.status(400).send({ error: "No valid fields to update" });
    }

    values.push(id);

    try {
        const sql = `UPDATE users SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const resultUpdate = await request.server.db.run(sql, values);

        if (resultUpdate.changes === 0) {
            return reply.status(404).send({ error: "User not found" });
        }

        const resultQuery = await request.server.db.query(
            "SELECT id, username, email, avatar FROM users WHERE id = ?",
            [id],
        );
        const updated = resultQuery[0] as User;

        return reply.status(200).send({ user: updated });
    } catch (err: any) {
        request.log.error(err);
        if (err.message.includes("UNIQUE constraint failed")) {
            return reply.status(409).send({ error: "Username or email already in use" });
        }
        return reply.status(500).send({ error: "Update failed" });
    }
}

export const updateUserSchema = {
    body: {
        type: "object",
        properties: {
            username: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            avatar: { type: "string", format: "uri-reference" },
        },
        additionalProperties: false,
    },
    response: {
        200: {
            type: "object",
            properties: {
                user: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        username: { type: "string" },
                        email: { type: "string" },
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
