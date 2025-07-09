import "./style.css";
import navbarTemplate from "./templates/navbar.html?raw";
import adLightboxTemplate from "./templates/adLightbox.html?raw";

document.querySelector<HTMLDivElement>("#navbar-container")!.innerHTML =
  navbarTemplate;

document.querySelector<HTMLDivElement>("#ad-lightbox")!.innerHTML =
  adLightboxTemplate;

document.querySelector<HTMLAnchorElement>("#link-2")!.href =
  "/src/game/game.html";

// menu
const userMenuButton = document.getElementById("user-menu-button")!;
const menu = document.querySelector('[role="menu"]')!;

document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;

  if (userMenuButton.contains(target)) {
    menu.classList.toggle("hidden");
    return;
  }

  if (!menu.contains(target)) {
    menu.classList.add("hidden");
  }
});

// advertisement
const adLightbox = document.getElementById("ad-lightbox")!;
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
