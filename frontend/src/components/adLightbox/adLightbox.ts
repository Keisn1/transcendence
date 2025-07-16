import adLightboxTemplate from "./adLightbox.html?raw";

export class AdLightBox {
    private container: HTMLDivElement;
    private eventListeners: (() => void)[] = [];

    constructor() {
        const adLightbox = document.createElement("div");
        adLightbox.id = "ad-lightbox";
        adLightbox.classList.add("hidden");
        adLightbox.innerHTML = adLightboxTemplate;
        adLightbox.classList.add("flex", "justify-center"); // this needs to be handled elsewhere

        this.container = adLightbox;
        this.setupEvents();
    }

    getContainer(): HTMLDivElement {
        return this.container;
    }

    setupEvents() {
        const showAd = () => this.container.classList.remove("hidden");
        const hideAd = () => this.container.classList.add("hidden");

        const showAdAfterTimeout = () => {
            setTimeout(showAd, 1000); // wait 1 seconds
        };
        window.addEventListener("load", showAdAfterTimeout);

        this.eventListeners.push(() => {
            window.removeEventListener("load", showAdAfterTimeout); // only initially page load
            // if you insist of seeing the load everytime on Dashboard
            // just put
            // showAdAfterTimeout();
            // instead of
            // window.addEventListener("load", showAdAfterTimeout);
        });

        const hideAdAfterClick = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.id === "ad-close-btn") {
                hideAd();
            }
        };

        this.container.addEventListener("click", hideAdAfterClick);

        this.eventListeners.push(() => {
            this.container.removeEventListener("click", hideAdAfterClick);
        });
    }

    destroy() {
        this.eventListeners.forEach((cleanup) => cleanup());
        this.eventListeners = [];
    }
}
