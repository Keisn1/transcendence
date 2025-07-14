import "./style.css";
import "./components/navbar/navbar.ts"; // Add this line
import "./components/adLightbox/adLightbox.ts"; // Add this line
import Router from "./router.ts";

const router = new Router();

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e: MouseEvent) => {
        if ((e.target as HTMLElement)?.matches("[data-link]")) {
            e.preventDefault();
            router.navigateTo((e.target as HTMLAnchorElement).href);
        }
    });
});
