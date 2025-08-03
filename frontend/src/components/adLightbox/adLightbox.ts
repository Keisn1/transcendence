import { BaseComponent } from "../BaseComponent";
import adLightboxTemplate from "./adLightbox.html?raw";

export class AdLightBox extends BaseComponent {
    private closeBtn: HTMLElement;
    constructor() {
        super("div", "ad-lightbox-container", "hidden flex justify-center");
        this.container.innerHTML = adLightboxTemplate;
        this.closeBtn = this.container.querySelector("#ad-close-btn")!;
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
        this.addEventListenerWithCleanup(this.closeBtn, "click", () => hideAd());
    }

    destroy(): void {
        super.destroy();
    }
}
