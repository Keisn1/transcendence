import { BaseComponent } from "../../BaseComponent";
import gameControlsTemplate from "./gameControls.html?raw";
import { type AiLevel } from "../../../game/game";
import type IGameControls from "../IGameControls.ts";

export class GameControlsComponent extends BaseComponent implements IGameControls {
    public startBtn: HTMLButtonElement;
    private aiSelect: HTMLSelectElement;
    private startCallbacks: Array<(level: AiLevel) => void> = [];
    private selectionChangeCallbacks: Array<(level: AiLevel) => void> = []; // Add this

    constructor() {
        super("div", "game-controls");
        this.container.innerHTML = gameControlsTemplate;
        this.aiSelect = this.container.querySelector("#ai-select") as HTMLSelectElement;
        this.startBtn = this.container.querySelector("#start-btn") as HTMLButtonElement;
        this.startBtn.addEventListener("click", this.handleStart.bind(this));
        this.addEventListenerWithCleanup(this.aiSelect, "change", this.handleSelectionChange.bind(this));
    }

    addToSelectionChangeCallbacks(fn: (level: AiLevel) => void) {
        this.selectionChangeCallbacks.push(fn);
    }

    removeFromSelectionChangeCallbacks(fn: (level: AiLevel) => void) {
        this.selectionChangeCallbacks = this.selectionChangeCallbacks.filter((cb) => cb !== fn);
    }

    private handleSelectionChange() {
        const level = this.aiSelect.value as AiLevel;
        this.selectionChangeCallbacks.forEach((cb) => cb(level));
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
