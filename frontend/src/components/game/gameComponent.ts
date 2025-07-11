import gameTemplate from "./game.html?raw";
import { PongGame } from "./game";

export class GameComponent {
    private container: HTMLDivElement;
    private canvas: HTMLCanvasElement;
    private game: PongGame;

    constructor() {
        const gameContainer = document.createElement("div");
        gameContainer.classList.add("relative", "flex", "items-center", "justify-center", "h-screen");
        gameContainer.id = "game-container";
        gameContainer.innerHTML = gameTemplate;

        this.canvas = gameContainer.querySelector("#canvas")! as HTMLCanvasElement;
        this.container = gameContainer;
        this.game = new PongGame(this.canvas, {});
    }

    getContainer(): HTMLDivElement {
        return this.container;
    }

    async play() {
        await this.game.start();
    }

    destroy() {}
}
