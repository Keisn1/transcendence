import { mockUsers, avatarOptions } from "./mockData";

export function setupMockApi() {
    const originalFetch = window.fetch;

    (window as any).fetch = async (url: string | Request, options?: RequestInit): Promise<Response> => {
        const urlString = typeof url === "string" ? url : url.url;

        if (urlString === "/api/profile/avatar" && options?.method === "POST") {
            const authHeader = options.headers ? (options.headers as Record<string, string>)["Authorization"] : null;
            const token = authHeader || localStorage.getItem("authToken");
            if (!token) return new Response("Unauthorized", { status: 401 });

            const randomAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];

            return new Response(JSON.stringify({ avatarUrl: randomAvatar }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (urlString === "/api/user" && options?.method === "PUT") {
            const authHeader = options.headers ? (options.headers as Record<string, string>)["Authorization"] : null;
            const token = authHeader || localStorage.getItem("authToken");
            if (!token) return new Response("Unauthorized", { status: 401 });

            const updates = JSON.parse(options.body as string);
            const userData = localStorage.getItem("user");

            if (userData) {
                const user = JSON.parse(userData);
                const updatedUser = { ...user, ...updates };
                localStorage.setItem("user", JSON.stringify(updatedUser));

                return new Response(JSON.stringify({ user: updatedUser }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            }

            return new Response("User not found", { status: 404 });
        }

        if (urlString === "/api/profile" && options?.method === "GET") {
            // Get auth token from headers or localStorage
            const authHeader = options.headers ? (options.headers as Record<string, string>)["Authorization"] : null;
            const token = authHeader || localStorage.getItem("authToken");

            if (!token) {
                return new Response("Unauthorized", { status: 401 });
            }

            // In real app, decode token. For mock, return current user
            const userData = localStorage.getItem("user");
            if (userData) {
                const user = JSON.parse(userData);
                return new Response(JSON.stringify(user), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            }

            return new Response("User not found", { status: 404 });
        }

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
            const newUser: any = {
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
