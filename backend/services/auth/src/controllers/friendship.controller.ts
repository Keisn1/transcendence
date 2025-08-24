// controllers/friendship.controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { v4 as uuidv4 } from "uuid";
import {
    GetFriendshipStatusResponse,
    GetPendingRequestsResponse,
    RespondToRequestBody,
    RespondToRequestResponse,
    SendFriendRequestResponse,
} from "../types/auth.types";

export async function getFriendshipStatus(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply,
): Promise<GetFriendshipStatusResponse> {
    const { userId } = request.params;
    const currentUserId = request.user.id;

    if (currentUserId === userId) {
        return reply.status(400).send({ error: "Cannot check friendship status with yourself" });
    }

    const friendship = await request.server.db.query(
        `
        SELECT status FROM friendships
        WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)
    `,
        [currentUserId, userId, userId, currentUserId],
    );

    const status = friendship[0]?.status || "none";

    return reply.status(200).send({
        status: status as "none" | "pending" | "accepted" | "declined",
    });
}

export async function respondToRequest(
    request: FastifyRequest<{ Params: { friendshipId: string }; Body: RespondToRequestBody }>,
    reply: FastifyReply,
): Promise<RespondToRequestResponse> {
    const { friendshipId } = request.params;
    const { action } = request.body;
    const userId = request.user.id;

    // Verify the friendship exists and belongs to current user
    const friendship = await request.server.db.query(
        "SELECT id FROM friendships WHERE id = ? AND addressee_id = ? AND status = 'pending'",
        [friendshipId, userId],
    );

    if (friendship.length === 0) {
        return reply.status(404).send({ error: "Friend request not found or already processed" });
    }

    const status = action === "accept" ? "accepted" : "declined";

    const result = await request.server.db.run(
        "UPDATE friendships SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [status, friendshipId],
    );

    if (result.changes === 0) {
        return reply.status(404).send({ error: "Friend request not found" });
    }

    return reply.status(200).send({ success: true });
}

export async function sendFriendRequest(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply,
): Promise<SendFriendRequestResponse> {
    const { userId } = request.params;
    const requesterId = request.user.id;

    if (requesterId === userId) {
        return reply.status(400).send({ error: "Cannot send friend request to yourself" });
    }

    // Check if friendship already exists
    const existing = await request.server.db.query(
        "SELECT id FROM friendships WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)",
        [requesterId, userId, userId, requesterId],
    );

    if (existing.length > 0) {
        return reply.status(409).send({ error: "Friendship request already exists" });
    }

    const friendshipId = uuidv4();
    await request.server.db.run(
        "INSERT INTO friendships (id, requester_id, addressee_id, status) VALUES (?, ?, ?, 'pending')",
        [friendshipId, requesterId, userId],
    );

    return reply.status(200).send({ success: true });
}

export async function getPendingRequests(
    request: FastifyRequest,
    reply: FastifyReply,
): Promise<GetPendingRequestsResponse> {
    const userId = request.user.id;

    const requests = await request.server.db.query(
        `
        SELECT f.id, f.requester_id, u.username, u.avatar, f.created_at
        FROM friendships f
        JOIN users u ON f.requester_id = u.id
        WHERE f.addressee_id = ? AND f.status = 'pending'
        ORDER BY f.created_at DESC
    `,
        [userId],
    );

    return reply.status(200).send({ requests });
}

export const sendFriendRequestSchema = {
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
                success: { type: "boolean" },
            },
            required: ["success"],
            additionalProperties: false,
        },
        400: {
            type: "object",
            properties: {
                error: { type: "string" },
            },
            required: ["error"],
            additionalProperties: false,
        },
        409: {
            type: "object",
            properties: {
                error: { type: "string" },
            },
            required: ["error"],
            additionalProperties: false,
        },
    },
} as const;

export const getPendingRequestsSchema = {
    response: {
        200: {
            type: "object",
            properties: {
                requests: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            requester_id: { type: "string" },
                            username: { type: "string" },
                            avatar: { type: "string", format: "uri-reference" },
                            created_at: { type: "string" },
                        },
                        required: ["id", "requester_id", "username", "avatar", "created_at"],
                        additionalProperties: false,
                    },
                },
            },
            required: ["requests"],
            additionalProperties: false,
        },
    },
} as const;

export const respondToRequestSchema = {
    params: {
        type: "object",
        properties: {
            friendshipId: { type: "string" },
        },
        required: ["friendshipId"],
        additionalProperties: false,
    },
    body: {
        type: "object",
        properties: {
            action: {
                type: "string",
                enum: ["accept", "decline"],
            },
        },
        required: ["action"],
        additionalProperties: false,
    },
    response: {
        200: {
            type: "object",
            properties: {
                success: { type: "boolean" },
            },
            required: ["success"],
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

export const getFriendshipStatusSchema = {
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
                status: {
                    type: "string",
                    enum: ["none", "pending", "accepted", "declined"],
                },
            },
            required: ["status"],
            additionalProperties: false,
        },
        400: {
            type: "object",
            properties: {
                error: { type: "string" },
            },
            required: ["error"],
            additionalProperties: false,
        },
    },
} as const;

export async function getFriends(request: FastifyRequest, reply: FastifyReply): Promise<{ friends: any[] }> {
    const userId = request.user.id;

    const friends = await request.server.db.query(
        `
        SELECT
            CASE
                WHEN f.requester_id = ? THEN u2.id
                ELSE u1.id
            END as friend_id,
            CASE
                WHEN f.requester_id = ? THEN u2.username
                ELSE u1.username
            END as username,
            CASE
                WHEN f.requester_id = ? THEN u2.avatar
                ELSE u1.avatar
            END as avatar,
            CASE
                WHEN f.requester_id = ? THEN u2.is_online
                ELSE u1.is_online
            END as isOnline,
            CASE
                WHEN f.requester_id = ? THEN u2.last_seen
                ELSE u1.last_seen
            END as lastSeen
        FROM friendships f
        LEFT JOIN users u1 ON f.requester_id = u1.id
        LEFT JOIN users u2 ON f.addressee_id = u2.id
        WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = 'accepted'
        ORDER BY isOnline DESC, lastSeen DESC
        `,
        [userId, userId, userId, userId, userId, userId, userId],
    );

    return reply.status(200).send({ friends });
}

export const getFriendsSchema = {
    response: {
        200: {
            type: "object",
            properties: {
                friends: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            friend_id: { type: "string" },
                            username: { type: "string" },
                            avatar: { type: "string" },
                            isOnline: { type: "boolean" },
                            lastSeen: { type: ["string", "null"] },
                        },
                    },
                },
            },
        },
    },
} as const;
