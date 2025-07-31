import gameTemplate from "./game.html?raw";
import { PongGame } from "../../game/game";
import { BaseComponent } from "../BaseComponent";
import { type AiLevel } from "../../game/game";
import { GameControlsComponent } from "../gameControls/gameControls";
import { GameControlsTournamentComponent } from "../gameControlsTournament/gameControls";

interface IGameControls {
    onStart(fn: (level?: AiLevel) => void): void;
    offStart(fn: (level?: AiLevel) => void): void;
    getContainer(): HTMLElement;
    reset(): void;
}

type ControlsCtor = (new () => GameControlsComponent) | (new () => GameControlsTournamentComponent);

export class GameComponent extends BaseComponent {
    private canvas: HTMLCanvasElement;
    private game: PongGame;
    private gameControls: IGameControls;

    constructor(ControlsClass: ControlsCtor) {
        super("div", "game-container");

        this.container.innerHTML = gameTemplate;
        this.canvas = this.container.querySelector("#canvas")!;
        this.game = new PongGame(this.canvas);

        this.gameControls = new ControlsClass() as IGameControls;
        this.gameControls.onStart(this.startCallback);
        this.container.appendChild(this.gameControls.getContainer());
    }

    private startCallback = (level?: AiLevel) => {
        this.game.destroy();
        const ctx = this.canvas.getContext("2d")!;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.game = new PongGame(this.canvas);
        if (level !== undefined) {
            this.game.setAiLevel(level);
        }
        this.play();
    };

    async play() {
        await this.game.start();
    }

    destroy() {
        super.destroy();
        this.gameControls.offStart(this.startCallback);
        this.game.destroy();
        document.getElementById("game-container")?.remove();
    }
}

