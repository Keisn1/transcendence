import { BaseComponent } from "../BaseComponent";

export type AiLevel = "none" | "easy" | "hard";

export class GameControlsComponent extends BaseComponent {
	private startBtn: HTMLButtonElement;
	private aiSelect: HTMLSelectElement;

	constructor() {
		super("div", "game-controls");
		this.container.innerHTML = `
		<select id="ai-select" class="mr-2">
			<option value="none">Two-Player</option>
			<option value="easy">AI Easy</option>
			<option value="hard">AI Hard</option>
		</select>
		<button id="start-btn">Start Game</button>
		`;

		this.aiSelect = this.container.querySelector("#ai-select") as HTMLSelectElement;
		this.startBtn = this.container.querySelector("#start-btn") as HTMLButtonElement;

		this.container.style.position = "absolute";
		this.container.style.top = "5rem";
		this.container.style.right = "2rem";
	}

	onStart(fn: (aiLevel: AiLevel) => void) {
		this.startBtn.addEventListener("click", () => {
			this.startBtn.disabled = true;
			fn(this.aiSelect.value as AiLevel);
			this.startBtn.textContent = "Restart Game";
		});
	}

	reset() {
		this.startBtn.disabled = false;
		this.startBtn.textContent = "Start Game";
	}
}
