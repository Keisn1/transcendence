import { FastifyRequest, FastifyReply } from "fastify";
import { Profile } from "../types/auth.types";

export default async function getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id;

    try {
        const userRecords = await request.server.db.query(
            "SELECT id, username, email, avatar, twofa_enabled FROM users WHERE id = ?",
            [userId],
        );

        if (!userRecords.length) {
            return reply.status(404).send({ error: "User not found" });
        }

        const user = userRecords[0];
        const profile: Profile = {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            twoFaEnabled: Boolean(user.twofa_enabled),
        };

        return reply.status(200).send({ profile });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Failed to fetch profile" });
    }
}

export const getProfileSchema = {
    response: {
        200: {
            type: "object",
            properties: {
                profile: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        username: { type: "string" },
                        email: { type: "string", format: "email" },
                        avatar: { type: "string", format: "uri-reference" },
                        twoFaEnabled: { type: "boolean" },
                    },
                    required: ["id", "username", "email", "avatar"],
                },
            },
        },
    },
} as const;
