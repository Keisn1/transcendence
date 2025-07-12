import navbarTemplate from "./navbar.html?raw";

export class Navbar {
    private container: HTMLDivElement;
    private eventListeners: (() => void)[] = [];

    constructor() {
        const navbarContainer = document.createElement("div");
        navbarContainer.id = "navbar-container";
        navbarContainer.innerHTML = navbarTemplate;

        this.container = navbarContainer;
        this.setupEvents();
        this.setupLinks();
    }

    getContainer(): HTMLDivElement {
        return this.container;
    }

    setupLinks() {
        this.container.querySelector<HTMLAnchorElement>("#link-1")!.href = "/";
        this.container.querySelector<HTMLAnchorElement>("#link-2")!.href = "/game";
    }

    setupEvents() {
        const button = this.container.querySelector("#user-menu-button")!;
        const menu = this.container.querySelector('[role="menu"]')!;

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
