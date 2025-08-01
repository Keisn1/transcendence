import { mockUsers, avatarOptions } from "./mockData";

export function setupMockApi() {
    const originalFetch = window.fetch;

    (window as any).fetch = async (url: string | Request, options?: RequestInit): Promise<Response> => {
        const urlString = typeof url === "string" ? url : url.url;

        if (urlString === "/api/upload/avatar" && options?.method === "POST") {
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

        if (urlString === "/api/auth/login" && options?.method === "POST") {
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

        if (urlString === "/api/auth/signup" && options?.method === "POST") {
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

        if (urlString === "/api/verify-player" && options?.method === "POST") {
            const authHeader = options.headers ? (options.headers as Record<string, string>)["Authorization"] : null;
            const token = authHeader || localStorage.getItem("authToken");
            if (!token) {
                return new Response("Unauthorized", { status: 401 });
            }

            const { playerEmail, playerPassword } = JSON.parse(options.body as string) as {
                playerEmail: string;
                playerPassword: string;
            };

            const user = mockUsers.find((u) => u.email === playerEmail && u.password === playerPassword);

            if (user) {
                const { password, ...userWithoutPassword } = user;
                return new Response(
                    JSON.stringify({
                        user: userWithoutPassword,
                    }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }

            return new Response("Unauthorized", { status: 401 });
        }

        if (urlString === "/api/tournament" && options?.method === "POST") {
            const authHeader = options.headers ? (options.headers as Record<string, string>)["Authorization"] : null;
            const token = authHeader || localStorage.getItem("authToken");
            if (!token) {
                console.log("unauthorised");
                return new Response("Unauthorized", { status: 401 });
            }

            const { userIds } = JSON.parse(options.body as string) as {
                userIds: string[];
            };

            if (!userIds || userIds.length < 2) {
                return new Response("Need at least two players", { status: 400 });
            }

            const players = userIds
                .map((id) => mockUsers.find((u) => u.id === id))
                .filter((u): u is (typeof mockUsers)[number] => !!u);

            const matches = [];
            for (let i = 0; i < players.length; i += 2) {
                const p1 = players[i];
                const p2 = players[i + 1] ?? null;
                matches.push({
                    matchId: `m${i / 2 + 1}`,
                    player1: p1,
                    player2: p2,
                    round: 1,
                    // result: null,
                });
            }

            const tournament = {
                id: `t${Date.now()}`,
                playerIds: userIds,
                players: players.map(({ password, ...u }) => u),
                matches: matches,
            };

            return new Response(JSON.stringify(tournament), {
                status: 201,
                headers: { "Content-Type": "application/json" },
            });
        }

        return originalFetch(url, options);
    };
}
