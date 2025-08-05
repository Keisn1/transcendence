import { BaseComponent } from "../BaseComponent";
import modalTemplate from "./gdprWarningModal.html?raw";

export class GdprWarningModal extends BaseComponent {
    private confirmBtn: HTMLButtonElement;
    private cancelBtn: HTMLButtonElement;
    private onConfirm?: (action: "delete" | "anonymize") => void;
    private action: "delete" | "anonymize";

    constructor(action: "delete" | "anonymize", onConfirm?: (action: "delete" | "anonymize") => void) {
        super("div", "gdpr-warning-modal");
        this.action = action;
        this.onConfirm = onConfirm;

        const actionText = action === "delete" ? "delete" : "anonymize";
        const actionVerb = action === "delete" ? "deletion" : "anonymization";

        this.container.innerHTML = modalTemplate
            .replace(/{{actionText}}/g, actionText)
            .replace(/{{actionVerb}}/g, actionVerb)
            .replace(/{{actionTextCapitalized}}/g, actionText.charAt(0).toUpperCase() + actionText.slice(1));

        this.confirmBtn = this.container.querySelector("#confirm-gdpr-action")!;
        this.cancelBtn = this.container.querySelector("#cancel-gdpr-action")!;

        this.setupEvents();
    }

    private setupEvents() {
        this.addEventListenerWithCleanup(this.cancelBtn, "click", () => {
            this.hide();
        });

        this.addEventListenerWithCleanup(this.confirmBtn, "click", () => {
            if (this.onConfirm) {
                this.onConfirm(this.action);
            }
            this.hide();
        });
    }

    show() {
        document.body.appendChild(this.container);
    }

    hide() {
        this.container.remove();
        this.destroy();
    }
}
