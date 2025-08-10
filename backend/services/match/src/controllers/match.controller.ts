import { FastifyRequest, FastifyReply } from "fastify";
import { MatchBody } from "../types/match.types";
import { v4 as uuidv4 } from "uuid";

export async function recordMatch(request: FastifyRequest<{ Body: MatchBody }>, reply: FastifyReply): Promise<void> {
    const body = request.body;
    console.log(body);

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
                uuidv4(),
                body.player1Id,
                body.player2Id,
                body.player1Score,
                body.player2Score,
                body.gameMode,
                body.duration ?? null,
            ],
        );

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
): Promise<void> {
    const { id } = request.params;
    try {
        const match = await request.server.db.query(`SELECT * FROM matches WHERE id = ?`, [id]);
        if (!match) {
            return reply.status(404).send({ error: "Match not found" });
        }
        return reply.send(match);
    } catch (error) {
        console.error("Failed to fetch match:", error);
        return reply.status(500).send({ error: "Internal server error" });
    }
}

export const recordMatchSchema = {
    body: {
        type: "object",
        properties: {
            player1Id: { type: "string" },
            player2Id: { type: "string" },
            player1Score: { type: "number" },
            player2Score: { type: "number" },
            gameMode: { type: "string", enum: ["pvp", "ai-easy", "ai-hard"] },
            duration: { type: "number" },
        },
        required: ["player1Id", "player2Id", "player1Score", "player2Score", "gameMode"],
        additionalProperties: false,
    },
} as const;

export const getMatchSchema = {
    params: {
        type: "object",
        properties: { id: { type: "string", format: "uuid" } },
        required: ["id"],
    },
} as const;
