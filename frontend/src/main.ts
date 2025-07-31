import "./style.css";
import "./components/navbar/navbar.ts"; // Add this line
import "./components/adLightbox/adLightbox.ts"; // Add this line
import Router from "./router.ts";
import { AuthController } from "./controllers/auth.controller.ts";
import { TournamentController } from "./controllers/tournament.controller.ts";

const router = new Router();
AuthController.getInstance(router);
TournamentController.getInstance(router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e: MouseEvent) => {
        if ((e.target as HTMLElement)?.matches("[data-link]")) {
            e.preventDefault();
            router.navigateTo((e.target as HTMLAnchorElement).href);
        }
    });
});

// // Conditional mock setup
// if (import.meta.env.DEV) {
//     console.log("using mock");
//     const { setupMockApi } = await import("./mocks/mockAPI.ts");
//     setupMockApi();
// }
