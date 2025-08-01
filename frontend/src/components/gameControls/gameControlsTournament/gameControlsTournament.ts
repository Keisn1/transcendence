import { BaseComponent } from "../../BaseComponent";
import gameControlsTemplate from "./gameControlsTournament.html?raw";
import type IGameControls from "../IGameControls";

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

    onStart(fn: (level?: any) => void) {
        this.startCallbacks.push(() => fn());
    }

    offStart(fn: (level?: any) => void) {
        this.startCallbacks = this.startCallbacks.filter(cb => cb !== fn);
    }

    onFinish(fn: () => void) {
        this.finishCallbacks.push(fn);
    }

    offFinish(fn: () => void) {
        this.finishCallbacks = this.finishCallbacks.filter(cb => cb !== fn);
    }

    private handleClick() {
        if (!this.started) {
            this.started = true;
            this.startBtn.textContent = "Finish Match";
            this.startCallbacks.forEach(fn => fn());
        } else {
            this.finishCallbacks.forEach(fn => fn());
            this.reset();
        }
    }

    reset() {
        this.started = false;
        this.startBtn.disabled = false;
        this.startBtn.textContent = "Start Game";
    }
}
