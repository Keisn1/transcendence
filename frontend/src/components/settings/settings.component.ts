import settingsTemplate from "./settings.html?raw";
import { BaseComponent } from "../BaseComponent.ts";

export class Settings extends BaseComponent {
    constructor() {
        super("div", "settings-container");
        this.container.innerHTML = settingsTemplate;
    }

    destroy(): void {
        super.destroy();
    }
}
