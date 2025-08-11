import { BaseComponent } from "../../BaseComponent";
import gameControlsTemplate from "./gameControls.html?raw";
import type IGameControls from "../IGameControls.ts";
import { type GameMode } from "../../../types/game.types.ts";

export class GameControlsComponent extends BaseComponent implements IGameControls {
    public startBtn: HTMLButtonElement;
    private aiSelect: HTMLSelectElement;
    private startCallbacks: Array<(mode: GameMode) => void> = [];
    private selectionChangeCallbacks: Array<(mode: GameMode) => void> = []; // Add this

    constructor() {
        super("div", "game-controls");
        this.container.innerHTML = gameControlsTemplate;
        this.aiSelect = this.container.querySelector("#ai-select") as HTMLSelectElement;
        this.startBtn = this.container.querySelector("#start-btn") as HTMLButtonElement;
        this.startBtn.addEventListener("click", this.handleStart.bind(this));
        this.addEventListenerWithCleanup(this.aiSelect, "change", this.handleSelectionChange.bind(this));
    }

    addToSelectionChangeCallbacks(fn: (mode: GameMode) => void) {
        this.selectionChangeCallbacks.push(fn);
    }

    removeFromSelectionChangeCallbacks(fn: (mode: GameMode) => void) {
        this.selectionChangeCallbacks = this.selectionChangeCallbacks.filter((cb) => cb !== fn);
    }

    private handleSelectionChange() {
        const level = this.aiSelect.value as GameMode;
        this.selectionChangeCallbacks.forEach((cb) => cb(level));
    }

    addToStartCallbacks(fn: (mode: GameMode) => void) {
        this.startCallbacks.push((level) => fn(level));
    }

    removeFromStartCallbacks(fn: (mode: GameMode) => void) {
        this.startCallbacks = this.startCallbacks.filter((cb) => cb !== fn);
    }

    addToFinishCallbacks(_: () => void): void {}
    removeFromFinishCallbacks(_: () => void): void {}

    private handleStart() {
        const level = this.aiSelect.value as GameMode;
        this.startBtn.textContent = "Restart Game";
        this.startCallbacks.forEach((cb) => cb(level));
    }

    reset() {
        this.startBtn.disabled = false;
        this.startBtn.textContent = "Start Game";
        this.aiSelect.value = "none";
    }
}
