import { BaseComponent } from "../../BaseComponent";
import gameControlsTemplate from "./gameControls.html?raw";
import { type AiLevel } from "../../../game/game";

export class GameControlsComponent extends BaseComponent {
    private startBtn: HTMLButtonElement;
    private aiSelect: HTMLSelectElement;
    private startCallbacks: Array<(level: AiLevel) => void> = [];

    constructor() {
        super("div", "game-controls");
        this.container.innerHTML = gameControlsTemplate;
        this.aiSelect = this.container.querySelector("#ai-select") as HTMLSelectElement;
        this.startBtn = this.container.querySelector("#start-btn") as HTMLButtonElement;
    }

    onStart(fn: (level: AiLevel) => void) {
        this.startCallbacks.push(fn);

        // Only add DOM listener once
        if (this.startCallbacks.length === 1) {
            this.startBtn.addEventListener("click", this.handleStart.bind(this));
        }
    }

    onFinish(fn: () => void) {
        // this.finishCallbacks.push(fn);
    }

    private handleStart() {
        const level = this.aiSelect.value as AiLevel;
        this.setStarting();

        this.startCallbacks.forEach((fn) => fn(level));
    }

    private setStarting() {
        this.startBtn.textContent = "Restart Game";
    }

    reset() {
        this.startBtn.disabled = false;
        this.startBtn.textContent = "Start Game";
        this.aiSelect.value = "none";
    }

    offStart(fn: (level: AiLevel) => void) {
        const index = this.startCallbacks.indexOf(fn);
        if (index > -1) this.startCallbacks.splice(index, 1);
    }
}
