import { BaseComponent } from "../BaseComponent";
import adLightboxTemplate from "./adLightbox.html?raw";

export class AdLightBox extends BaseComponent {
    constructor() {
        super("div", "ad-lightbox-container", ["hidden", "flex", "justify-center"]);
        this.container.innerHTML = adLightboxTemplate;
        this.setupEvents();
    }

    setupEvents() {
        const showAd = () => this.container.classList.remove("hidden");
        const hideAd = () => this.container.classList.add("hidden");

        const showAdAfterTimeout = () => {
            setTimeout(showAd, 1000); // wait 1 second
        };

        // Attach to window
        window.addEventListener("load", showAdAfterTimeout);
        this.eventListenerCleanups.push(() => {
            window.removeEventListener("load", showAdAfterTimeout);
        });

        // For DOM elements, use the helper method
        const closeBtn = this.container.querySelector("#ad-close-btn") as HTMLElement;
        if (closeBtn) {
            this.addEventListenerWithCleanup(closeBtn, "click", () => hideAd());
        }
    }
    destroy(): void {
        super.destroy();
    }
}
