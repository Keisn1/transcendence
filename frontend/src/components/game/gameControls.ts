import { BaseComponent } from "../BaseComponent";

export type AiLevel = "none" | "easy" | "hard";

export class GameControlsComponent extends BaseComponent {
	private startBtn: HTMLButtonElement;
	private aiSelect: HTMLSelectElement;

	constructor() {
		super("div", "game-controls");
		this.container.innerHTML = `
		<div class="flex items-center space-x-2">
			<select id="ai-select" class="px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-2 focus:ring-grey-500">
			<option value="none">Two-Player</option>
			<option value="easy">AI Easy</option>
			<option value="hard">AI Hard</option>
			</select>
			<button id="start-btn" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded shadow transition">Start Game</button>
		</div>
		`;

		this.aiSelect = this.container.querySelector("#ai-select") as HTMLSelectElement;
		this.startBtn = this.container.querySelector("#start-btn") as HTMLButtonElement;

		this.container.classList.add("absolute", "top-20", "right-8", "z-10");
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
