import gdprButtonsTemplate from "./gdprButtons.html?raw";
import { BaseComponent } from "../BaseComponent.ts";
import { GdprWarningModal } from "../gdprWarningModal/gdprWarningModal.ts";

export class GdprButtons extends BaseComponent {
    private deleteButton: HTMLElement;
    private anonymizeButton: HTMLElement;
    private downloadButton: HTMLElement;
    private onGdprAction?: (action: "delete" | "anonymize") => void;

    constructor(onGdprAction?: (action: "delete" | "anonymize") => void) {
        super("div", "gdpr-buttons-container");
        this.onGdprAction = onGdprAction;
        this.container.innerHTML = gdprButtonsTemplate;

        this.deleteButton = this.container.querySelector<HTMLButtonElement>("#delete-data-btn")!;
        this.anonymizeButton = this.container.querySelector<HTMLButtonElement>("#anonymize-data-btn")!;
        this.downloadButton = this.container.querySelector<HTMLButtonElement>("#download-data-btn")!;

        this.setupEvents();
    }

    private setupEvents() {
        this.addEventListenerWithCleanup(this.deleteButton, "click", () => {
            this.showWarning("delete");
        });

        this.addEventListenerWithCleanup(this.anonymizeButton, "click", () => {
            this.showWarning("anonymize");
        });

        this.addEventListenerWithCleanup(this.downloadButton, "click", () => {
            this.downloadUserData();
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

    private async downloadUserData() {
        try {
            const response = await fetch("/api/gdpr/download", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            });

            const result = await response.json();
            if (result.success) {
                // Create and download JSON file
                const dataStr = JSON.stringify(result.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(dataBlob);
                
                const downloadLink = document.createElement("a");
                downloadLink.href = url;
                downloadLink.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                URL.revokeObjectURL(url);
                
                console.log("User data downloaded successfully");
            } else {
                alert(result.error || "Failed to download user data.");
            }
        } catch (err) {
            console.error("Download error:", err);
            alert("Network error or server unavailable.");
        }
    }

    destroy(): void {
        super.destroy();
    }
}
