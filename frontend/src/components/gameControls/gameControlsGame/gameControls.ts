import { BaseComponent } from "../../BaseComponent";
import gameControlsTemplate from "./gameControls.html?raw";
import { type AiLevel } from "../../../game/game";
import type IGameControls from "../IGameControls.ts";

export class GameControlsComponent extends BaseComponent implements IGameControls {
    public startBtn: HTMLButtonElement;
    private aiSelect: HTMLSelectElement;
    private startCallbacks: Array<(level: AiLevel) => void> = [];

    constructor() {
        super("div", "game-controls");
        this.container.innerHTML = gameControlsTemplate;
        this.aiSelect = this.container.querySelector("#ai-select") as HTMLSelectElement;
        this.startBtn = this.container.querySelector("#start-btn") as HTMLButtonElement;
        this.startBtn.addEventListener("click", this.handleStart.bind(this));
    }

    addToStartCallbacks(fn: (level?: AiLevel) => void) {
        this.startCallbacks.push((level) => fn(level));
    }

    removeFromStartCallbacks(fn: (level?: AiLevel) => void) {
        this.startCallbacks = this.startCallbacks.filter((cb) => cb !== fn);
    }

    addToFinishCallbacks(_: () => void): void {}
    removeFromFinishCallbacks(_: () => void): void {}

    private handleStart() {
        const level = this.aiSelect.value as AiLevel;
        this.startBtn.textContent = "Restart Game";
        this.startCallbacks.forEach((cb) => cb(level));
    }

    reset() {
        this.startBtn.disabled = false;
        this.startBtn.textContent = "Start Game";
        this.aiSelect.value = "none";
    }
}
