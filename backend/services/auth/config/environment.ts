export const config = {
    userService: {
        url: process.env.USER_SERVICE_URL || "http://localhost:3001",
        mock: process.env.MOCK_USER_SERVICE === "true" || process.env.NODE_ENV === "development",
    },
    jwt: {
        secret: process.env.JWT_SECRET || "supersecret",
    },
};
