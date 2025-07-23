import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { GameComponent } from "../components/game/gameComponent.ts";
import Router from "../router.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private gameComponent: GameComponent | null = null;

    constructor(router?: Router) {
        super(router);
        this.setTitle("Game");
    }

    render() {
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        this.gameComponent = new GameComponent();
        const gameContainer = this.gameComponent.getContainer();
        document.body.appendChild(gameContainer);

        const startBtn = document.createElement("button");
        startBtn.id = "start-game-btn";
        startBtn.textContent = "Start Game";
        startBtn.classList.add("px-4","py-2","bg-gray-700","text-white","rounded");
        startBtn.style.position = "absolute";
        startBtn.style.top      = "9rem";
        startBtn.style.right    = "1rem";
        gameContainer.appendChild(startBtn);

        startBtn.addEventListener("click", () => {
            startBtn.disabled = true;
            if (this.gameComponent) {
            this.gameComponent.play().then(() => {
                startBtn.disabled = false;
            });
            }
        });
    }

    destroy() {
        console.log("destroying dashboard View");

        this.navbar?.destroy();
        this.gameComponent?.destroy();

        // Remove DOM elements
        document.getElementById("navbar-container")?.remove();
        document.getElementById("game-container")?.remove();

        // Clear references
        this.navbar = null;
        this.gameComponent = null;
    }
}
