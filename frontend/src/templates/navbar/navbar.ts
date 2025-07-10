// menu
import navbarTemplate from "./navbar.html?raw";

document.querySelector<HTMLDivElement>("#navbar-container")!.innerHTML = navbarTemplate;

const userMenuButton = document.getElementById("user-menu-button")!;
const menu = document.querySelector('[role="menu"]')!;

document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    if (userMenuButton.contains(target)) {
        menu.classList.toggle("hidden");
        return;
    }

    if (!menu.contains(target)) {
        menu.classList.add("hidden");
    }
});
