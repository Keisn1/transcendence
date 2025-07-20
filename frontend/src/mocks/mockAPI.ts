const mockUsers = [
    { id: "1", username: "admin", password: "admin123", email: "admin@example.com" },
    { id: "2", username: "user", password: "user123", email: "user@example.com" },
];

export function setupMockApi() {
    const originalFetch = window.fetch;

    (window as any).fetch = async (url: string | Request, options?: RequestInit): Promise<Response> => {
        const urlString = typeof url === "string" ? url : url.url;

        if (urlString === "/api/user/login" && options?.method === "POST") {
            const body = JSON.parse(options.body as string);
            const user = mockUsers.find((u) => u.email === body.email && u.password === body.password);

            if (user) {
                const { password, ...userWithoutPassword } = user;
                return new Response(
                    JSON.stringify({
                        token: "mock-jwt-token-12345", // Add mock token
                        user: userWithoutPassword,
                    }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            } else {
                return new Response("Unauthorized", { status: 401 });
            }
        }

        return originalFetch(url, options);
    };
}
