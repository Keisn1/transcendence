import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { AdLightBox } from "../components/adLightbox/adLightbox.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private adLightBox: AdLightBox | null = null;

    constructor() {
        super();
        this.setTitle("Dashboard");
    }

    render() {
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        this.adLightBox = new AdLightBox();
        document.body.appendChild(this.adLightBox.getContainer());
    }

    destroy() {
        console.log("destroying dashboard View");
        // Clean up components
        this.navbar?.destroy();
        this.adLightBox?.destroy();

        // Remove DOM elements
        document.getElementById("navbar-container")?.remove();
        document.getElementById("ad-lightbox")?.remove();

        // Clear references
        this.navbar = null;
        this.adLightBox = null;
    }
}
