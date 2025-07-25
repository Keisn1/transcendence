export default async function healthRoute(request: any, reply: any) {
    try {
        // Test database connection with a simple query
        await request.server.db.query("SELECT 1 as test");

        return {
            status: "healthy",
            service: "auth-service",
            timestamp: new Date().toISOString(),
            database: {
                type: "sqlite",
                file: "./db/auth.db",
                status: "connected",
            },
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown database error";
        return reply.status(503).send({
            status: "unhealthy",
            service: "auth-service",
            timestamp: new Date().toISOString(),
            database: {
                type: "sqlite",
                file: "./db/auth.db",
                status: "disconnected",
                error: errorMessage,
            },
        });
    }
}
