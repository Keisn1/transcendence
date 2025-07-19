import { config } from "../config/environment";

interface CreateUserData {
    username: string;
    email: string;
}

interface User {
    id: number;
    username: string;
    email: string;
}

const mockUsers: User[] = [];

async function createUser(userData: CreateUserData): Promise<User> {
    if (config.userService.mock) {
        console.log("🔧 Using mock user service");

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Check for existing username or email
        const existingUser = mockUsers.find(
            (user) => user.username === userData.username || user.email === userData.email,
        );

        console.log(mockUsers);
        if (existingUser) {
            const mockResponse = {
                ok: false,
                status: 409,
                statusText: "Conflict",
            };
            throw new Error(`User service error: ${mockResponse.status} ${mockResponse.statusText}`);
        }

        // Mock successful response
        const newUser = {
            id: Math.floor(Math.random() * 1000) + 1,
            username: userData.username,
            email: userData.email,
        };
        mockUsers.push(newUser);

        // Mock successful response
        return newUser;
    }

    // Real implementation - calls your user service
    try {
        console.log("🌐 Calling real user service");
        const response = await fetch(`${config.userService.url}/api/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: userData.username,
                email: userData.email,
            }),
        });

        if (!response.ok) {
            throw new Error(`User service error: ${response.status} ${response.statusText}`);
        }

        const user = await response.json();

        // Validate response structure
        if (!user || !user.id) {
            throw new Error("Invalid user service response");
        }

        return user;
    } catch (err) {
        const error = err as Error;
        console.error("User service error:", error);
        throw new Error(`User service failed: ${error.message}`);
    }
}

export { createUser };
