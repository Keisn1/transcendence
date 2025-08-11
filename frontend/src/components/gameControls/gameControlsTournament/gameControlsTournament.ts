import { BaseComponent } from "../../BaseComponent";
import gameControlsTemplate from "./gameControlsTournament.html?raw";
import type IGameControls from "../IGameControls";
import type { GameMode } from "../../../types/game.types";

export class GameControlsTournamentComponent extends BaseComponent implements IGameControls {
    public startBtn: HTMLButtonElement;
    private started = false;
    private startCallbacks: Array<() => void> = [];
    private finishCallbacks: Array<() => void> = [];

    constructor() {
        super("div", "game-controls");
        this.container.innerHTML = gameControlsTemplate;
        this.startBtn = this.container.querySelector("#start-btn") as HTMLButtonElement;
        this.startBtn.addEventListener("click", this.handleClick.bind(this));
    }

    addToStartCallbacks(fn: (mode: GameMode) => void) {
        this.startCallbacks.push(() => fn("tournament"));
    }

    removeFromStartCallbacks(fn: (mode: GameMode) => void) {
        this.startCallbacks = this.startCallbacks.filter((cb) => cb !== fn);
    }

    addToFinishCallbacks(fn: () => void) {
        this.finishCallbacks.push(fn);
    }

    removeFromFinishCallbacks(fn: () => void) {
        this.finishCallbacks = this.finishCallbacks.filter((cb) => cb !== fn);
    }

    toggleStartBtn() {
        console.log("toggling start button");
        if (this.startBtn.disabled) {
            this.startBtn.disabled = false;
        } else {
            this.startBtn.disabled = true;
        }
    }

    private handleClick() {
        if (!this.started) {
            this.started = true;
            this.startBtn.textContent = "Finish Match";
            this.startCallbacks.forEach((fn) => fn());
            this.toggleStartBtn();
        } else {
            this.finishCallbacks.forEach((fn) => fn());
            this.reset();
        }
    }

    reset() {
        this.started = false;
        this.startBtn.disabled = false;
        this.startBtn.textContent = "Start Game";
    }
}
