import "fastify";

declare module "fastify" {
    interface FastifyInstance {
        jwt: {
            sign(payload: any, options?: any): string;
            verify(token: string, options?: any): any;
        };
        db: {
            query(sql: string, params?: any[]): Promise<any[]>;
            run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }>;
        };
    }
}
