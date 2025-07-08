import "./style.css";
import typescriptLogo from "/typescript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.ts";
import navbarTemplate from "./templates/navbar.html?raw";

document.querySelector<HTMLDivElement>("#navbar-container")!.innerHTML =
  navbarTemplate;

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`;

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

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
