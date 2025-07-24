import { BaseComponent } from "../BaseComponent";
import gameControlsTemplate from "./gameControls.html?raw"
import { type AiLevel } from "../../game/game";

export class GameControlsComponent extends BaseComponent {
	private startBtn: HTMLButtonElement;
	private aiSelect: HTMLSelectElement;

	constructor() {
		super("div", "game-controls");
		this.container.innerHTML = gameControlsTemplate;

		this.aiSelect = this.container.querySelector("#ai-select") as HTMLSelectElement;
		this.startBtn = this.container.querySelector("#start-btn") as HTMLButtonElement;
	}

	onStart(fn: (level: AiLevel) => void) {
		this.startBtn.addEventListener("click", () => {
			this.startBtn.disabled = true;
			fn(this.aiSelect.value as AiLevel);
			this.startBtn.textContent = "Restart Game";
		});
	}

	reset() {
		this.startBtn.disabled = false;
		this.startBtn.textContent = "Start Game";
		this.aiSelect.value = "none";
	}
}
