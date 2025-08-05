import gdprButtonsTemplate from "./gdprButtons.html?raw";
import { BaseComponent } from "../BaseComponent.ts";
import { GdprWarningModal } from "../gdprWarningModal/gdprWarningModal.ts";

export class GdprButtons extends BaseComponent {
    private deleteButton: HTMLElement;
    private anonymizeButton: HTMLElement;
    private onGdprAction?: (action: "delete" | "anonymize") => void;

    constructor(onGdprAction?: (action: "delete" | "anonymize") => void) {
        super("div", "gdpr-buttons-container");
        this.onGdprAction = onGdprAction;
        this.container.innerHTML = gdprButtonsTemplate;

        this.deleteButton = this.container.querySelector<HTMLButtonElement>("#delete-data-btn")!;
        this.anonymizeButton = this.container.querySelector<HTMLButtonElement>("#anonymize-data-btn")!;

        this.setupEvents();
    }

    private setupEvents() {
        this.addEventListenerWithCleanup(this.deleteButton, "click", () => {
            this.showWarning("delete");
        });

        this.addEventListenerWithCleanup(this.anonymizeButton, "click", () => {
            this.showWarning("anonymize");
        });
    }

    private showWarning(action: "delete" | "anonymize") {
        const modal = new GdprWarningModal(action, (confirmedAction) => {
            if (this.onGdprAction) {
                this.onGdprAction(confirmedAction);
            }
        });
        modal.show();
    }

    destroy(): void {
        super.destroy();
    }
}
