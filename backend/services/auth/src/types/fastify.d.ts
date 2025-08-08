import "fastify";
import { User } from "./auth.types";

declare module "fastify" {
    interface FastifyRequest {
        jwtVerify(): Promise<{ id: string; username: string; email: string; avatar: string; twoFaEnabled: boolean }>;
        user: User;
    }
    interface FastifyInstance {
        jwtAuth(request: FastifyRequest, reply: FastifyReply): Promise<void>;
        jwt: {
            sign(payload: any, options?: any): string; // Create JWT tokens
            verify(token: string, options?: any): any; // Verify JWT tokens
        };

        // Database plugin methods
        db: {
            query(sql: string, params?: any[]): Promise<any[]>; // SELECT queries
            run(
                sql: string,
                params?: any[],
            ): Promise<{
                // INSERT/UPDATE/DELETE
                lastID: number; // Auto-generated ID
                changes: number; // Rows affected
            }>;
        };
    }
}
