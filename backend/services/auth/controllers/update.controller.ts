import { FastifyRequest, FastifyReply } from "fastify";
import { genSaltSync, hashSync } from "bcrypt";
import { RunResult } from "sqlite3";
import { UpdateUserBody, UpdateUserResponse } from "../types/auth.types";

export default async function update(
	request: FastifyRequest<{ Params: { id: number }; Body: UpdateUserBody }> ,
	reply: FastifyReply
	): Promise<UpdateUserResponse> {
	const userId = request.params.id;
	const { username, email, password } = request.body;

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

	if (fields.length == 0) {
		return reply.status(400).send({ error: "No valid fields to update" });
	}

	values.push(userId);

	try {
		const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
		const result = await request.server.db.run(sql, values);

		if (result.changes === 0) {
			return reply.status(404).send({ error: "User not found" });
		}

		const [updated] = await request.server.db.query(
			"SELECT id, username, email FROM users WHERE id = ?",
			[userId]
		);

		return updated;
	} catch(err: any) {
		request.log.error(err);
		if (err.message.includes("UNIQUE constraint failed")) {
			return reply.status(409).send({ error: "Username or email already in use" });
		}
		return reply.status(500).send({ error: "Update failed" });
	}
}

export const updateUserSchema = {
	params: {
		type: "object",
		properties: {
			id: { type: "number" }
		},
		required: ["id"],
	},
	body: {
		type: "object",
		properties: {
			username: { type: "string", minLength: 1 },
			email: { type: "string", format: "email" },
			password: { type: "string", minLength: 8 }
		},
		additionalProperties: false,
	},
	response: {
		200: {
			type: "object",
			properties: {
				id: { type: "number" },
				username: { type: "string" },
				email: { type: "string" }
			}
		}
	}
} as const;
