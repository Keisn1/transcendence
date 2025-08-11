import type { GameMode } from "../../types/game.types";

export default interface IGameControls {
    startBtn: HTMLButtonElement;
    addToStartCallbacks(fn: (mode: GameMode) => void): void;
    addToFinishCallbacks(fn: () => void): void;
    removeFromStartCallbacks(fn: (mode: GameMode) => void): void;
    removeFromFinishCallbacks(fn: () => void): void;
    getContainer(): HTMLElement;
    reset(): void;
    toggleStartBtn?(): void;
    addToSelectionChangeCallbacks?(fn: (mode: GameMode) => void): void;
    removeFromSelectionChangeCallbacks?(fn: (mode: GameMode) => void): void;
}
