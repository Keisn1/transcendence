/// <reference types="vite/client" />
export default defineConfig({
    server: {
        proxy: {
            "/api": "http://localhost:3000",
        },
    },
});
