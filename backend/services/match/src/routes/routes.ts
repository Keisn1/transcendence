import { FastifyInstance } from "fastify";
import { recordMatch, recordMatchSchema, getMatchById, getMatchSchema } from "../controllers/match.controller";
import { MatchBody } from "../types/match.types";

export async function routes(fastify: FastifyInstance) {
    fastify.post<{ Body: MatchBody }>("/match", { preHandler: fastify.jwtAuth, schema: recordMatchSchema }, recordMatch);
    fastify.get<{ Params: { id: string } }>("/match/:id", { schema: getMatchSchema }, getMatchById);
}