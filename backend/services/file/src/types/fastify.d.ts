import "fastify";

declare module "fastify" {
    interface FastifyRequest {
        jwtVerify(): Promise<{
            id: string;
            username: string;
            avatar: string;
            twoFaEnabled: boolean;
        }>;
        user: User;
    }
    interface FastifyInstance {
        jwtAuth(request: FastifyRequest, reply: FastifyReply): Promise<void>;
        jwt: {
            sign(payload: any, options?: any): string; // Create JWT tokens
            verify(token: string, options?: any): any; // Verify JWT tokens
        };
    }
}
