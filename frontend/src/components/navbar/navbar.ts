// menu
import navbarTemplate from "./navbar.html?raw";

export class Navbar {
    render() {
        let navbar: HTMLDivElement = document.createElement("div");
        navbar.id = "navbar-container";
        navbar.innerHTML = navbarTemplate;
        document.body.appendChild(navbar);
        // document.querySelector<HTMLDivElement>("#navbar-container")!.innerHTML = navbarTemplate;

        const userMenuButton = document.getElementById("user-menu-button")!;
        const menu = document.querySelector('[role="menu"]')!;
        document.querySelector<HTMLAnchorElement>("#link-2")!.href = "/src/game/game.html";

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
    }
}
