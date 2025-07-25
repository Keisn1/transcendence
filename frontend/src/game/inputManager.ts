type TriggerType = "hold" | "once";

export class InputManager {
    private keys = new Map<string, boolean>();
    private keyBindings = new Map<string, { action: () => void; trigger: TriggerType }>();
    private justPressedKeys = new Set<string>();

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners() {
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (this.keys.has(e.key)) {
            if (!this.keys.get(e.key)) {
                this.justPressedKeys.add(e.key);
            }
            e.preventDefault();
            this.keys.set(e.key, true);
        }
    }

    private handleKeyUp(e: KeyboardEvent) {
        if (this.keys.has(e.key)) {
            e.preventDefault();
            this.keys.set(e.key, false);
        }
    }

    bindKey(key: string, action: () => void, trigger: TriggerType = "hold") {
        this.keys.set(key, false);
        this.keyBindings.set(key, { action, trigger });
    }

    processInput(isPaused: boolean) { // TODO: find clean way of doing this
        for (const [key, pressed] of this.keys) {
            const binding = this.keyBindings.get(key);
            if (!binding) continue;

            if (binding.trigger === "once" && this.justPressedKeys.has(key)) {
                binding.action();
            }
            if (binding.trigger === "hold" && pressed && !isPaused) {
                binding.action();
            }
        }
        this.justPressedKeys.clear();
    }

    destroy() {
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("keyup", this.handleKeyUp);
        this.keys.clear();
        this.keyBindings.clear();
        this.justPressedKeys.clear();
    }
}
