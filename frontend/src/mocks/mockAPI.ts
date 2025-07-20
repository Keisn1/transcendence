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

        if (urlString === "/api/user/signup" && options?.method === "POST") {
            const body = JSON.parse(options.body as string);

            // Check if user already exists
            const existingUser = mockUsers.find((u) => u.email === body.email);
            if (existingUser) {
                return new Response("User already exists", { status: 409 });
            }

            // Create new user
            const newUser = {
                id: String(mockUsers.length + 1),
                username: body.username,
                email: body.email,
                password: body.password,
            };

            mockUsers.push(newUser);

            const { password, ...userWithoutPassword } = newUser;
            return new Response(
                JSON.stringify({
                    token: "mock-jwt-token-" + newUser.id,
                    user: userWithoutPassword,
                }),
                {
                    status: 201,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        return originalFetch(url, options);
    };
}
