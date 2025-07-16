import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    constructor() {
        super();
        this.setTitle("Dashboard");
    }

    render() {
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        let profileContainer = document.createElement("div");
        profileContainer.id = "profile-container";
        profileContainer.innerHTML = "Hello World";

        fetch("/api/profile")
            .then((response) => response.text())
            .then((text) => console.log(text));
        document.body.appendChild(profileContainer);
    }
    destroy() {
        console.log("Destroying ProfileView");
        this.navbar?.destroy();
        document.getElementById("navbar-container")?.remove();
        document.getElementById("profile-container")?.remove();
    }
}
