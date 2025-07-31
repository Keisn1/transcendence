import { BaseComponent } from "../BaseComponent";
import gameControlsTemplate from "./gameControls.html?raw";

export class GameControlsTournamentComponent extends BaseComponent {
    public startBtn: HTMLButtonElement;
    private startCallbacks: Array<() => void> = [];

    constructor() {
        super("div", "game-controls");
        this.container.innerHTML = gameControlsTemplate;
        this.startBtn = this.container.querySelector("#start-btn") as HTMLButtonElement;
    }

    onStart(fn: () => void) {
        this.startCallbacks.push(fn);

        if (this.startCallbacks.length === 1) {
            this.startBtn.addEventListener("click", this.handleStart.bind(this));
        }
    }

    private handleStart() {
        this.setStarting();
        this.startCallbacks.forEach((fn) => fn());
    }

    private setStarting() {
        this.startBtn.textContent = "Restart Game";
    }

    reset() {
        this.startBtn.disabled = false;
        this.startBtn.textContent = "Start Game";
    }

    offStart(fn: () => void) {
        const index = this.startCallbacks.indexOf(fn);
        if (index > -1) this.startCallbacks.splice(index, 1);
    }
}
