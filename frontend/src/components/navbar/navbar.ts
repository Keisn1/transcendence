import navbarTemplate from "./navbar.html?raw";

export class Navbar {
    private eventListeners: (() => void)[] = [];

    render(): string {
        return navbarTemplate;
    }

    setupLinks() {
        document.querySelector<HTMLAnchorElement>("#link-2")!.href = "/src/game/game.html";
    }

    setupEvents() {
        const button = document.getElementById("user-menu-button")!;
        const menu = document.querySelector('[role="menu"]')!;

        const toggleMenu = () => menu.classList.toggle("hidden");

        button.addEventListener("click", toggleMenu);

        // Store cleanup function
        this.eventListeners.push(() => {
            button.removeEventListener("click", toggleMenu);
        });
    }

    destroy() {
        this.eventListeners.forEach((cleanup) => cleanup());
        this.eventListeners = [];
    }
}
