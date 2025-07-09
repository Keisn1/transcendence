import adLightboxTemplate from "./adLightbox.html?raw";

document.querySelector<HTMLDivElement>("#ad-lightbox")!.innerHTML =
    adLightboxTemplate;

// advertisement
const adLightbox = document.getElementById("ad-lightbox")!;
adLightbox.classList.add("hidden");

const adCloseButton = document.getElementById("ad-close-btn")!;

function showAd(): void {
    adLightbox.classList.remove("hidden");
}

function hideAd(): void {
    adLightbox.classList.add("hidden");
}

adCloseButton.addEventListener("click", hideAd);

adLightbox.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target === adLightbox) {
        hideAd();
    }
});

window.addEventListener("load", () => {
    console.log("hello");
    setTimeout(showAd, 2000); // wait 2 seconds
});
