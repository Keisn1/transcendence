import "./style.css";
import "./components/navbar/navbar.ts"; // Add this line
import "./components/adLightbox/adLightbox.ts"; // Add this line
import Router from "./router.ts";
import { AuthController } from "./controllers/AuthController.ts";

import { setupMockApi } from "./mocks/mockAPI.ts";

setupMockApi(); // Add this before other initialization

const router = new Router();
AuthController.getInstance(router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e: MouseEvent) => {
        if ((e.target as HTMLElement)?.matches("[data-link]")) {
            e.preventDefault();
            router.navigateTo((e.target as HTMLAnchorElement).href);
        }
    });
});
