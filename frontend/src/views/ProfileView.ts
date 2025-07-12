import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Dashboard");
    }

    render() {
        let navbar = new Navbar();
        document.body.appendChild(navbar.getContainer());

        let profileContainer = document.createElement("div");
        profileContainer.id = "profile-container";
        profileContainer.innerHTML = "Hello World";
        fetch("/api/profile")
            .then((response) => response.text())
            .then((text) => console.log(text));
        document.body.appendChild(profileContainer);
    }
}
