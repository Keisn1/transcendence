import { BaseComponent } from "../BaseComponent";
import gameControlsTemplate from "./gameControls.html?raw";

export class GameControlsTournamentComponent extends BaseComponent {
    public startBtn: HTMLButtonElement;
    private started = false;

    private startCallbacks:  Array<() => void> = [];
    private finishCallbacks: Array<() => void> = [];

    constructor() {
        super("div", "game-controls");
        this.container.innerHTML = gameControlsTemplate;
        this.startBtn = this.container.querySelector("#start-btn") as HTMLButtonElement;
        this.startBtn.addEventListener("click", this.handleClick.bind(this));
    }

    onStart(fn: () => void) {
        this.startCallbacks.push(fn);
    }

    onFinish(fn: () => void) {
        this.finishCallbacks.push(fn);
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

    offStart(fn: () => void) {
        const i = this.startCallbacks.indexOf(fn);
        if (i >= 0) this.startCallbacks.splice(i, 1);
    }

    offFinish(fn: () => void) {
        const i = this.finishCallbacks.indexOf(fn);
        if (i >= 0) this.finishCallbacks.splice(i, 1);
    }
}
