import { FastifyRequest, FastifyReply } from "fastify";
import { compareSync, genSaltSync, hashSync } from "bcrypt";
import { GetOnlineStatusResponse, PublicUser, UpdateUserBody, UpdateUserResponse } from "../types/auth.types";
import https from "https";
import fetch from "node-fetch";
import fs from "fs";
import { Agent } from "http";
import {
    isStrongPassword,
    isValidEmail,
    isValidUsername,
    sanitizeVisibleInput,
    validateAvatarPath,
} from "../utils/validation";

// Helper functions (copy from gdpr.controller.ts)
let internalServiceAgent: Agent = new Agent();
if (process.env.ENV === "production") {
    internalServiceAgent = new https.Agent({
        ca: fs.readFileSync("/vault/init/ca_cert.crt"),
        rejectUnauthorized: false,
    });
}

function getServiceUrl(serviceName: string, port: number): string {
    const isProduction = process.env.ENV === "production";
    const protocol = isProduction ? "https" : "http";
    return `${protocol}://${serviceName}:${port}`;
}

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
    if (userId == "00000000-0000-0000-0000-000000000000") {
        return reply.status(200).send({
            publicUser: {
                id: "00000000-0000-0000-0000-000000000000",
                username: "unknown",
                avatar: "uploads/default-pfp.png",
            },
        });
    }
    if (userId == "00000000-0000-0000-0000-000000000001") {
        return reply.status(200).send({
            publicUser: {
                id: "00000000-0000-0000-0000-000000000001",
                username: "AI Easy",
                avatar: "uploads/default-pfp.png",
            },
        });
    }
    if (userId == "00000000-0000-0000-0000-000000000002") {
        return reply.status(200).send({
            publicUser: {
                id: "00000000-0000-0000-0000-000000000002",
                username: "AI Hard",
                avatar: "uploads/default-pfp.png",
            },
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
    const body = request.body as UpdateUserBody;

    const hasValidFields = body.username || body.email || body.password || body.avatar;
    if (!hasValidFields) {
        return reply.status(400).send({ error: "At least one field must be provided for update" });
    }

    // Password change requires currentPassword
    if (body.password && !body.currentPassword) {
        return reply.status(400).send({ error: "Current password is required to change password" });
    }

    // Get current user data to check old avatar
    let oldAvatar = null;
    const avatar = body.avatar;
    if (avatar) {
        const currentUser = await request.server.db.query("SELECT avatar FROM users WHERE id = ?", [id]);
        oldAvatar = currentUser[0]?.avatar;
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (body.username !== undefined) {
        const username = sanitizeVisibleInput(body.username).toLowerCase();
        if (username.length < 3 || username.length > 20 || !isValidUsername(username)) {
            return reply.status(400).send({ error: "Invalid username" });
        }
        fields.push("username = ?");
        values.push(username);
    }

    if (body.email !== undefined) {
        const email = sanitizeVisibleInput(body.email);
        if (email.length < 3 || email.length > 254 || !isValidEmail(email)) {
            return reply.status(400).send({ error: "Invalid email" });
        }
        fields.push("email = ?");
        values.push(email);
    }

    // Add this validation before the password update section:
    if (body.password !== undefined) {
        // If currentPassword is provided, verify it first
        if (body.currentPassword) {
            const currentUser = await request.server.db.query("SELECT password_hash FROM users WHERE id = ?", [id]);

            if (!currentUser[0] || !compareSync(body.currentPassword, currentUser[0].password_hash)) {
                return reply.status(400).send({ error: "Current password is incorrect" });
            }
        }

        if (body.password.length < 8 || body.password.length > 128 || !isStrongPassword(body.password)) {
            return reply.status(400).send({ error: "Invalid password" });
        }

        const salt = genSaltSync(10);
        const passwordHash = hashSync(body.password, salt);
        fields.push("password_hash = ?");
        values.push(passwordHash);
    }

    if (body.avatar) {
        if (!validateAvatarPath(body.avatar)) {
            return reply.status(400).send({ error: "Invalid avatar path" });
        }
        fields.push("avatar = ?");
        values.push(body.avatar);
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

        if (avatar && oldAvatar && oldAvatar !== avatar && !isDefaultAvatar(oldAvatar)) {
            const filename = oldAvatar.replace("/uploads/", "");
            await deleteOldAvatar(request, filename);
        }

        const resultQuery = await request.server.db.query(
            "SELECT id, username, avatar, twofa_enabled as twoFaEnabled FROM users WHERE id = ?",
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

// Helper function
function isDefaultAvatar(avatarPath: string): boolean {
    return (
        avatarPath === "/uploads/default-pfp.png" ||
        avatarPath === "default-pfp.png" ||
        avatarPath.endsWith("/default-pfp.png")
    );
}

// Helper function to delete old avatar
async function deleteOldAvatar(request: FastifyRequest, filename: string) {
    try {
        const generateServiceToken = () => {
            return request.server.jwt.sign(
                {
                    iss: "auth-service",
                    aud: "file-service",
                    sub: "system",
                    scope: "file:delete",
                },
                { expiresIn: "5m" },
            );
        };

        const fileServiceUrl = getServiceUrl("file-service", 3001);
        const response = await fetch(`${fileServiceUrl}/api/internal/avatar/${filename}`, {
            method: "DELETE",
            agent: internalServiceAgent,
            headers: {
                Authorization: `Bearer ${generateServiceToken()}`,
            },
        });

        if (!response.ok) {
            console.warn(`Failed to delete old avatar ${filename}: ${response.status}`);
        } else {
            console.log(`Successfully deleted old avatar: ${filename}`);
        }
    } catch (error) {
        console.warn(`Error deleting old avatar ${filename}:`, error);
        // Don't fail the user update if avatar deletion fails
    }
}

export const updateUserSchema = {
    body: {
        type: "object",
        properties: {
            username: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            currentPassword: { type: "string", minLength: 1, maxLength: 128 },
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
                        avatar: { type: "string", format: "uri-reference" },
                        twoFaEnabled: { type: "boolean" },
                    },
                    required: ["id", "username", "avatar", "twoFaEnabled"],
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
