import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { genSaltSync, hashSync } from "bcrypt-ts";

declare module "fastify" {
    interface FastifyInstance {
        jwt: {
            sign(payload: any, options?: any): string;
            verify(token: string, options?: any): any;
        };
        db: {
            query(sql: string, params?: any[]): Promise<any[]>;
        };
    }
}

const registerSchema = {
    body: {
        type: "object",
        properties: {
            username: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
        },
        required: ["username", "email", "password"],
        additionalProperties: false,
    },
    response: {
        201: {
            type: "object",
            properties: {
                token: { type: "string" }, // Added token
                user: {
                    type: "object",
                    properties: {
                        id: { type: "number" },
                        username: { type: "string" },
                        email: { type: "string" },
                    },
                },
            },
        },
    },
} as const;

export async function routes(app: FastifyInstance) {
    app.get("/health", async () => {
        return {
            status: "healthy",
            service: "auth-service",
            timestamp: new Date().toISOString(),
            // database: {
            //   host: dbConfig.host,
            //   port: dbConfig.port,
            //   database: dbConfig.database,
            // },
        };
    });
    app.post("/register", { schema: registerSchema }, register);
}

interface RegisterBody {
    username: string;
    password: string;
    email: string;
}

interface RegisterResponse {
    id: number;
    username: string;
    email: string;
    avatar: string;
}

async function register(request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply): Promise<void> {
    const { username, password, email } = request.body;

    try {
        // 1. Create user in User Service
        const userResponse = await fetch("http://user-service:3001/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email }),
        });

        if (!userResponse.ok) {
            const error = await userResponse.json();
            return reply.code(userResponse.status).send(error);
        }

        const user = await userResponse.json();

        // 2. Store auth credentials in Auth Service
        const salt = genSaltSync(10);
        const passwordHash = hashSync(password, salt);

        // Store in your auth database
        // server is a
        await request.server.db.query("INSERT INTO auth_credentials (user_id, password_hash, salt) VALUES (?, ?, ?)", [
            user.id,
            passwordHash,
            salt,
        ]);

        // 3. Generate JWT token
        const token = request.server.jwt.sign({ id: user.id, username: user.username }, { expiresIn: "24h" });

        return reply.code(201).send({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        return reply.code(500).send({ error: " Internal server error" });
    }
}
