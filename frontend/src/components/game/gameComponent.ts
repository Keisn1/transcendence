import gameTemplate from "./game.html?raw";
import { PongGame } from "../../game/game";
import { BaseComponent } from "../BaseComponent";
import { type AiLevel } from "../../game/game";


export class GameComponent extends BaseComponent {
    private canvas: HTMLCanvasElement;
    private game: PongGame;

    constructor() {
        super("div", "game-container");

        this.container.innerHTML = gameTemplate;
        this.canvas = this.container.querySelector("#canvas")! as HTMLCanvasElement;
        this.game = new PongGame(this.canvas);
    }

    public setAiLevel(level: AiLevel) {
        this.game.setAiLevel(level);
    }

    async play() {
        await this.game.start();
    }

    destroy() {
        super.destroy();
        this.game?.destroy();

        // Remove DOM elements
        document.getElementById("game-container")?.remove();
    }
}
