import adLightboxTemplate from "./adLightbox.html?raw";

export class AdLightBox {
    private container: HTMLDivElement;

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

        window.addEventListener("load", () => {
            console.log("hello");
            setTimeout(showAd, 1000); // wait 1 seconds
        });

        this.container.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (target.id === "ad-close-btn") {
                hideAd();
            }
        });
    }
}
