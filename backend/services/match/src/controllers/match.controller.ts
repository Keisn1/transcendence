import { FastifyRequest, FastifyReply } from "fastify";
import { PostMatchBody } from "../types/match.types";
import { v4 as uuidv4 } from "uuid";
import { GetMatchResponse } from "../types/match.types";

export async function postMatch(request: FastifyRequest<{ Body: PostMatchBody }>, reply: FastifyReply): Promise<void> {
    const body = request.body;

    if (
        !body ||
        !body.player1Id ||
        !body.player2Id ||
        typeof body.player1Score !== "number" ||
        typeof body.player2Score !== "number" ||
        !body.gameMode
    ) {
        return reply.status(400).send({ error: "Invalid match payload" });
    }

    try {
        const matchId = uuidv4();
        await request.server.db.run(
            `INSERT INTO matches
             (id, player1Id, player2Id, player1Score, player2Score, gameMode, duration)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                matchId,
                body.player1Id,
                body.player2Id,
                body.player1Score,
                body.player2Score,
                body.gameMode,
                body.duration ?? null,
            ],
        );

        if (body.gameMode === "tournament") {
            await request.server.db.run(`INSERT INTO tournament_matches (tournament_id, match_id) VALUES (?, ?)`, [
                body.tournamentId,
                matchId,
            ]);
        }

        return reply.status(201).send({ id: matchId, message: "Match recorded successfully" });
    } catch (err) {
        const error = err as Error;
        console.error("Save match error:", error);

        if (error.message.includes("UNIQUE constraint")) {
            return reply.status(409).send({ error: "Match already exists" });
        }

        return reply.status(500).send({ error: "Failed to record match" });
    }
}

export async function getMatchById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
): Promise<GetMatchResponse> {
    const { id } = request.params;
    try {
        const response = await request.server.db.query(`SELECT * FROM matches WHERE id = ?`, [id]);
        if (!response.length) {
            return reply.status(404).send({ error: "Match not found" });
        }
        const matchResponse: GetMatchResponse = response[0];
        return reply.status(200).send(matchResponse);
    } catch (error) {
        console.error("Failed to fetch match:", error);
        return reply.status(500).send({ error: "Internal server error" });
    }
}

export async function getUserMatches(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply,
): Promise<GetMatchResponse[]> {
    const { userId } = request.params;

    try {
        const matches = await request.server.db.query(
            `SELECT * FROM matches
             WHERE player1Id = ? OR player2Id = ?
             ORDER BY created_at DESC`,
            [userId, userId],
        );

        return reply.status(200).send(matches);
    } catch (error) {
        console.error("Failed to fetch user matches:", error);
        return reply.status(500).send({ error: "Failed to fetch matches" });
    }
}

export const getUserMatchesSchema = {
    params: {
        type: "object",
        properties: {
            userId: { type: "string", format: "uuid" },
        },
        required: ["userId"],
    },
    response: {
        200: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    player1Id: { type: "string", format: "uuid" },
                    player2Id: { type: "string", format: "uuid" },
                    player1Score: { type: "number" },
                    player2Score: { type: "number" },
                    gameMode: { type: "string" },
                    duration: { type: "number" },
                    created_at: { type: "string" },
                },
                required: ["id", "player1Id", "player2Id", "player1Score", "player2Score", "gameMode", "created_at"],
            },
        },
    },
} as const;

export const postMatchSchema = {
    body: {
        type: "object",
        properties: {
            player1Id: { type: "string", format: "uuid" },
            player2Id: { type: "string", format: "uuid" },
            player1Score: { type: "number" },
            player2Score: { type: "number" },
            gameMode: { type: "string", enum: ["pvp", "ai-easy", "ai-hard", "tournament"] },
            duration: { type: "number" },
            tournamentId: { type: "string" },
        },
        required: ["player1Id", "player2Id", "player1Score", "player2Score", "gameMode"],
        additionalProperties: false,
    },
    response: {
        201: {
            type: "object",
            properties: {
                id: { type: "string", format: "uuid" },
                message: { type: "string" },
            },
            required: ["id", "message"],
        },
    },
} as const;

export const getMatchSchema = {
    params: {
        type: "object",
        properties: { id: { type: "string", format: "uuid" } },
        required: ["id"],
    },
    response: {
        200: {
            type: "object",
            properties: {
                id: { type: "string", format: "uuid" },
                player1Id: { type: "string", format: "uuid" },
                player2Id: { type: "string", format: "uuid" },
                player1Score: { type: "number" },
                player2Score: { type: "number" },
                gameMode: { type: "string", enum: ["pvp", "ai-easy", "ai-hard", "tournament"] },
                duration: { type: "number" },
                created_at: { type: "string", format: "timestamp" },
            },
            required: [
                "id",
                "player1Id",
                "player2Id",
                "player1Score",
                "player2Score",
                "gameMode",
                "duration",
                "created_at",
            ],
        },
    },
} as const;
