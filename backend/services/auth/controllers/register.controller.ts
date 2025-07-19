import { FastifyRequest, FastifyReply } from "fastify";
import { genSaltSync, hashSync } from "bcrypt";
import { createUser } from "../services/userService";

interface RegisterBody {
    username: string;
    email: string;
    password: string;
}

interface RegisterResponse {
    id: number;
    username: string;
    email: string;
    avatar: string;
}

export default async function register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply,
): Promise<RegisterResponse> {
    const { username, email, password } = request.body;

    try {
        // Create user profile (only username/email)
        const userServiceUser = await createUser({
            username,
            email,
        });

        // Validate user service response
        if (!userServiceUser || !userServiceUser.id) {
            throw new Error("User service failed to create user");
        }

        // Hash password (stays in auth service)
        const salt = genSaltSync(10);
        const passwordHash = hashSync(password, salt);

        // Store only user_id and password_hash in auth service
        await request.server.db.run("INSERT INTO auth_credentials (user_id, password_hash) VALUES (?, ?)", [
            userServiceUser.id,
            passwordHash,
        ]);

        // Generate JWT with user service data
        const token = request.server.jwt.sign({
            id: userServiceUser.id,
            username: userServiceUser.username,
            email: userServiceUser.email,
        });

        return reply.status(201).send({
            token,
            user: {
                id: userServiceUser.id,
                username: userServiceUser.username,
                email: userServiceUser.email,
            },
        });
    } catch (err) {
        const error = err as Error;
        console.error("Registration error:", error);
        // More specific error handling
        if (error.message.includes("409")) {
            return reply.status(409).send({ error: "User already exists" });
        }
        if (error.message.includes("User service")) {
            return reply.status(502).send({ error: "External service unavailable" });
        }
        if (error.message.includes("UNIQUE constraint")) {
            return reply.status(409).send({ error: "User already exists" });
        }
        return reply.status(500).send({ error: "Registration failed" });
    }
}
