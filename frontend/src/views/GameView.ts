import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { GameComponent } from "../components/game/gameComponent.ts";
import Router from "../router.ts";
import { GameControlsComponent, type AiLevel } from "../components/game/gameControls";

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

        const controls = new GameControlsComponent();
        gameContainer.appendChild(controls.getContainer());

        controls.onStart((level: AiLevel) => {
            this.gameComponent?.setAiLevel(level);
            this.gameComponent?.play();
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
