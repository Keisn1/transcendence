import adLightboxTemplate from "./adLightbox.html?raw";

export class AdLightBox {
    render() {
        let adLightbox: HTMLDivElement = document.createElement("div");
        adLightbox.id = "ad-lightbox";
        adLightbox.classList.add("hidden");
        adLightbox.innerHTML = adLightboxTemplate;
        document.body.appendChild(adLightbox);

        const showAd = () => adLightbox.classList.remove("hidden");
        const hideAd = () => adLightbox.classList.add("hidden");

        window.addEventListener("load", () => {
            console.log("hello");
            setTimeout(showAd, 1000); // wait 1 seconds
        });

        adLightbox.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (target.id === "ad-close-btn") {
                hideAd();
            }
        });

        adLightbox.classList.add("flex", "justify-center"); // this needs to be handled elsewhere
    }
}
