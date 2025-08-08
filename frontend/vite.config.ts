import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
    plugins: [tailwindcss()],
    server: {
        host: "0.0.0.0",
        proxy: {
            "/api/auth": {
                target: "http://localhost:3000",
                changeOrigin: true,
                secure: false,
            },
            "/api/user": {
                target: "http://localhost:3000",
                changeOrigin: true,
                secure: false,
            },
            "/api/profile": {
                target: "http://localhost:3000",
                changeOrigin: true,
                secure: false,
            },
            "/api/file": {
                target: "http://localhost:3001",
                changeOrigin: true,
                secure: false,
            },
            "/uploads": {
                target: "http://localhost:3001",
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
