export class InputManager {
    private keys = new Map<string, boolean>();
    private keyBindings: Map<string, () => void> = new Map();

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners() {
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (this.keys.has(e.key)) {
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

    bindKey(key: string, action: () => void) {
        this.keys.set(key, false);
        this.keyBindings.set(key, action);
    }

    processInput() {
        for (const [key, pressed] of this.keys) {
            if (pressed) {
                const callback = this.keyBindings.get(key);
                if (callback !== undefined) {
                    callback();
                }
            }
        }
    }

    destroy() {
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("keyup", this.handleKeyUp);
        this.keys.clear();
        this.keyBindings.clear();
    }
}
