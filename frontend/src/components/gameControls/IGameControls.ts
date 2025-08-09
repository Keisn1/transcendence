import type { AiLevel } from "../../game/game";

export default interface IGameControls {
    startBtn: HTMLButtonElement;
    addToStartCallbacks(fn: (level?: AiLevel) => void): void;
    addToFinishCallbacks(fn: () => void): void;
    removeFromStartCallbacks(fn: (level?: AiLevel) => void): void;
    removeFromFinishCallbacks(fn: () => void): void;
    getContainer(): HTMLElement;
    reset(): void;
    toggleStartBtn?(): void;
    addToSelectionChangeCallbacks?(fn: (level: AiLevel) => void): void;
    removeFromSelectionChangeCallbacks?(fn: (level: AiLevel) => void): void;
}
