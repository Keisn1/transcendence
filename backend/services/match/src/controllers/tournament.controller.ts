import { FastifyRequest, FastifyReply } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { PostTournamentBody, PostTournamentResponse } from "../types/tournament.types";

export async function postTournament(
    request: FastifyRequest<{ Body: PostTournamentBody }>,
    reply: FastifyReply,
): Promise<PostTournamentResponse> {
    const { playerIds } = request.body;

    if (!playerIds || ![2, 4].includes(playerIds.length)) {
        return reply.status(400).send({ error: "Tournament must have exactly 2 or 4 players" });
    }

    const tournamentId = uuidv4();
    try {
        // Start transaction
        await request.server.db.run("BEGIN TRANSACTION");

        // Insert tournament
        await request.server.db.run(`INSERT INTO tournaments (id, player_count) VALUES (?, ?)`, [
            tournamentId,
            playerIds.length,
        ]);

        // Insert participants
        for (let i = 0; i < playerIds.length; i++) {
            await request.server.db.run(
                `INSERT INTO tournament_participants (tournament_id, player_id) VALUES (?, ?)`,
                [tournamentId, playerIds[i]],
            );
        }

        // Commit if everything succeeded
        await request.server.db.run("COMMIT");

        const response: PostTournamentResponse = { id: tournamentId };
        return reply.status(201).send(response);
    } catch (err) {
        // Rollback on any error
        await request.server.db.run("ROLLBACK");
        return reply.status(500).send({ error: "Failed to create tournament" });
    }
}

export const postTournamentSchema = {
    body: {
        type: "object",
        properties: {
            playerIds: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 4,
            },
        },
        required: ["playerIds"],
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
