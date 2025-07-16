import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { GameComponent } from "../components/game/gameComponent.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private gameComponent: GameComponent | null = null;

    constructor() {
        super();
        this.setTitle("GameView");
    }

    render() {
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        this.gameComponent = new GameComponent();
        document.body.appendChild(this.gameComponent.getContainer());
        this.gameComponent.play();
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
