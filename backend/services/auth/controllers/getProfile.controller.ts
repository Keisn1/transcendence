import { FastifyRequest, FastifyReply } from "fastify";

export default async function getProfile(request: FastifyRequest, reply: FastifyReply) {
	const { id, username, email } = request.user;
	return reply.send({ id, username, email })
}

export const getCurrentUserSchema = {
	response: {
		200: {
		type: "object",
		properties: {
			id:       { type: "number" },
			username: { type: "string" },
			email:    { type: "string", format: "email" }
		},
		required: ["id", "username", "email"],
		additionalProperties: false
		}
	}
} as const;
