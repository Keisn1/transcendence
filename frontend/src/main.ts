import "./style.css";
import "./templates/navbar/navbar.ts"; // Add this line
import "./templates/adLightbox/adLightbox.ts"; // Add this line

document.querySelector<HTMLAnchorElement>("#link-2")!.href =
  "/src/game/game.html";
