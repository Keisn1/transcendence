import "fastify";

declare module "fastify" {
    interface FastifyRequest {
        jwtVerify(): Promise<{ id: number, username: string, email: string }>;
        user: {
          id: number
          username: string
          email: string
        }
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
