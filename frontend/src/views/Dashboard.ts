import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { AdLightBox } from "../components/adLightbox/adLightbox.ts";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Dashboard");
    }

    render() {
        let navbar = new Navbar();
        document.body.innerHTML = navbar.render();
        navbar.setupLinks();
        navbar.setupEvents();

        let adLightBox = new AdLightBox();
        adLightBox.render();
        return "";
    }
}
