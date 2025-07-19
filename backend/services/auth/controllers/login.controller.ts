import { FastifyRequest, FastifyReply } from "fastify";
import { compareSync } from "bcrypt";
import { getUserById } from "../services/userService";

interface LoginBody {
    email: string;
    password: string;
}

export default async function login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
    const { email, password } = request.body;

    try {
        const authRecords = await request.server.db.query(
            "SELECT user_id, password_hash FROM auth_credentials WHERE email = ?",
            [email],
        );

        if (!authRecords.length || !compareSync(password, authRecords[0].password_hash)) {
            return reply.status(401).send({ error: "Invalid credentials" });
        }

        const userId = authRecords[0].user_id;

        // Get user profile from user service
        const user = await getUserById(userId); // You'll need this function
        if (!user) {
            // User exists in auth but not in user service - data inconsistency
            console.error(`User ${userId} exists in auth but not in user service`);
            return reply.status(500).send({ error: "Authentication service error" });
        }

        // Generate JWT
        const token = request.server.jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email,
        });

        return reply.send({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return reply.status(500).send({ error: "Login failed" });
    }
}
