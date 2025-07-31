import type { AiLevel } from "../../game/game";

export default interface IGameControls {
	startBtn: HTMLButtonElement;
	onStart(fn: (level?: AiLevel) => void): void;
	onFinish?(fn: () => void): void;
	offStart(fn: (level?: AiLevel) => void): void;
	offFinish?(fn: () => void): void;
	getContainer(): HTMLElement;
	reset(): void;
}
