import { FastifyRequest, FastifyReply } from "fastify";
import { genSaltSync, hashSync } from "bcrypt";
import { GetOnlineStatusResponse, PublicUser, UpdateUserBody, UpdateUserResponse } from "../types/auth.types";

export async function getOnlineStatus(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply,
): Promise<GetOnlineStatusResponse> {
    const { userId } = request.params;
    const currentUserId = request.user.id;

    // First check if they're friends
    const friendship = await request.server.db.query(
        `SELECT status FROM friendships
        WHERE ((requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?))
        AND status = 'accepted' `,
        [currentUserId, userId, userId, currentUserId],
    );

    if (friendship.length === 0) {
        return reply.status(403).send({ error: "Can only see online status of friends" });
    }

    // Get user's online status
    const user = await request.server.db.query("SELECT is_online, last_seen FROM users WHERE id = ?", [userId]);

    if (user.length === 0) {
        return reply.status(404).send({ error: "User not found" });
    }

    return reply.status(200).send({
        isOnline: Boolean(user[0].is_online),
        lastSeen: user[0].last_seen,
    });
}

export async function getUserById(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply,
): Promise<PublicUser> {
    const { userId } = request.params;
    console.log(userId);
    if (userId == "00000000-0000-0000-0000-000000000000") {
        return reply.status(200).send({
            publicUser: { id: "00000000-0000-0000-0000-000000000000", username: "unknown", avatar: "default-pfp.png" },
        });
    }
    if (userId == "00000000-0000-0000-0000-000000000001") {
        return reply.status(200).send({
            publicUser: { id: "00000000-0000-0000-0000-000000000001", username: "AI Easy", avatar: "default-pfp.png" },
        });
    }
    if (userId == "00000000-0000-0000-0000-000000000002") {
        return reply.status(200).send({
            publicUser: { id: "00000000-0000-0000-0000-000000000002", username: "AI Hard", avatar: "default-pfp.png" },
        });
    }

    try {
        const result = await request.server.db.query(`SELECT id, username, avatar FROM users WHERE id = ? `, [userId]);
        const publicUser = result[0];
        return reply.status(200).send({ publicUser: publicUser });
    } catch (error) {
        console.error("Failed to fetch user matches:", error);
        return reply.status(500).send({ error: "Failed to fetch matches" });
    }
}

export async function getUserByUsername(
    request: FastifyRequest<{ Params: { username: string } }>,
    reply: FastifyReply,
): Promise<PublicUser> {
    const { username } = request.params;
    console.log(username);

    try {
        const result = await request.server.db.query(`SELECT id, username, avatar FROM users WHERE username = ? `, [
            username,
        ]);

        const publicUser = result[0];

        return reply.status(200).send({ publicUser: publicUser });
    } catch (error) {
        console.error("Failed to fetch user matches:", error);
        return reply.status(500).send({ error: "Failed to fetch matches" });
    }
}

export async function updateUser(request: FastifyRequest, reply: FastifyReply): Promise<UpdateUserResponse> {
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
        const updated = resultQuery[0] as UpdateUserResponse;

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

export const getUserByUsernameSchema = {
    params: {
        type: "object",
        properties: { username: { type: "string" } },
        required: ["username"],
    },
    response: {
        200: {
            type: "object",
            properties: {
                publicUser: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        username: { type: "string" },
                        avatar: { type: "string", format: "uri-reference" },
                    },
                    required: ["id", "username", "avatar"],
                },
            },
            additionalProperties: false,
        },
    },
};

export const getUserByIdSchema = {
    params: {
        type: "object",
        properties: { userId: { type: "string" } },
        required: ["userId"],
    },
    response: {
        200: {
            type: "object",
            properties: {
                publicUser: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        username: { type: "string" },
                        avatar: { type: "string", format: "uri-reference" },
                    },
                    required: ["id", "username", "avatar"],
                },
            },
            additionalProperties: false,
        },
    },
};

export const getOnlineStatusSchema = {
    params: {
        type: "object",
        properties: {
            userId: { type: "string" },
        },
        required: ["userId"],
        additionalProperties: false,
    },
    response: {
        200: {
            type: "object",
            properties: {
                isOnline: { type: "boolean" },
                lastSeen: {
                    type: ["string", "null"],
                },
            },
            required: ["isOnline", "lastSeen"],
            additionalProperties: false,
        },
        403: {
            type: "object",
            properties: {
                error: { type: "string" },
            },
            required: ["error"],
            additionalProperties: false,
        },
        404: {
            type: "object",
            properties: {
                error: { type: "string" },
            },
            required: ["error"],
            additionalProperties: false,
        },
    },
} as const;
