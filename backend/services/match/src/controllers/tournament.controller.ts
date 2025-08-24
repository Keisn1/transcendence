import { FastifyRequest, FastifyReply } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { PostTournamentResponse, PostTournamentWithVerificationBody } from "../types/tournament.types";
import { isValidUUID } from "../utils/validation";

export async function postTournamentWithVerification(
    request: FastifyRequest<{ Body: PostTournamentWithVerificationBody }>,
    reply: FastifyReply,
): Promise<PostTournamentResponse> {
    const { playerTokens } = request.body;

    // Validate input structure
    if (!playerTokens || !Array.isArray(playerTokens)) {
        return reply.status(400).send({ error: "playerTokens must be an array" });
    }

    if (![2, 4].includes(playerTokens.length)) {
        return reply.status(400).send({ error: "Tournament must have 2 or 4 players" });
    }

    // Validate each player token
    for (const pt of playerTokens) {
        if (!pt.playerId || !pt.token) {
            return reply.status(400).send({ error: "Each player token must have playerId and token" });
        }

        if (!isValidUUID(pt.playerId)) {
            return reply.status(400).send({ error: "Invalid player ID format" });
        }

        if (typeof pt.token !== "string" || pt.token.length < 10) {
            return reply.status(400).send({ error: "Invalid token format" });
        }
    }

    // Check for duplicate players
    const playerIds = playerTokens.map((pt) => pt.playerId);
    const uniquePlayerIds = new Set(playerIds);
    if (uniquePlayerIds.size !== playerIds.length) {
        return reply.status(400).send({ error: "Duplicate players not allowed" });
    }

    // Verify all tokens
    for (const pt of playerTokens) {
        try {
            const decoded = request.server.jwt.verify(pt.token) as { id: string };

            if (decoded.id !== pt.playerId) {
                return reply.status(400).send({ error: "Invalid token for player" });
            }
        } catch (error) {
            return reply.status(400).send({ error: "Expired or invalid verification token" });
        }
    }

    const tournamentId = uuidv4();
    try {
        await request.server.db.run("BEGIN TRANSACTION");

        await request.server.db.run(`INSERT INTO tournaments (id, player_count) VALUES (?, ?)`, [
            tournamentId,
            playerTokens.length,
        ]);

        for (const pt of playerTokens) {
            await request.server.db.run(
                `INSERT INTO tournament_participants (tournament_id, player_id) VALUES (?, ?)`,
                [tournamentId, pt.playerId],
            );
        }

        await request.server.db.run("COMMIT");

        const response: PostTournamentResponse = { id: tournamentId };
        return reply.status(201).send(response);
    } catch (err) {
        await request.server.db.run("ROLLBACK");
        return reply.status(500).send({ error: "Failed to create tournament" });
    }
}

export const postTournamentWithVerificationSchema = {
    body: {
        type: "object",
        properties: {
            playerTokens: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        playerId: { type: "string" },
                        token: { type: "string" },
                    },
                    required: ["playerId", "token"],
                },
                minItems: 2,
                maxItems: 4,
            },
        },
        required: ["playerTokens"],
        additionalProperties: false,
    },
    response: {
        201: {
            type: "object",
            properties: {
                id: { type: "string" },
            },
            required: ["id"],
        },
    },
} as const;
