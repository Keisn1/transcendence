import gameTemplate from "./game.html?raw";
import { PongGame } from "../../game/game";
import { BaseComponent } from "../BaseComponent";
import { type AiLevel } from "../../game/game";
import { GameControlsComponent } from "../gameControls/gameControls";

export class GameComponent extends BaseComponent {
    private canvas: HTMLCanvasElement;
    private game: PongGame;
    private gameControls: GameControlsComponent;

    constructor() {
        super("div", "game-container");

        this.container.innerHTML = gameTemplate;
        this.canvas = this.container.querySelector("#canvas")! as HTMLCanvasElement;
        this.game = new PongGame(this.canvas);

        this.gameControls = new GameControlsComponent();
        this.gameControls.onStart(this.startCallback);
        this.container.appendChild(this.gameControls.getContainer());
    }

    private startCallback = (level: AiLevel) => {
        this.game.destroy();

        const ctx = this.canvas.getContext("2d")!;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.game = new PongGame(this.canvas);
        this.game.setAiLevel(level);
        this.play();
    };

    async play() {
        await this.game.start();
    }

    destroy() {
        super.destroy();
        this.gameControls?.offStart(this.startCallback); // Clean up callback
        this.game?.destroy();

        // Remove DOM elements
        document.getElementById("game-container")?.remove();
    }
}
