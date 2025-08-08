import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import type Router from "../router.ts";
import { ProfileComponent } from "../components/profile/profile.ts";
import { AuthService } from "../services/auth/auth.service.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private profileComponent: ProfileComponent | null = null;

    constructor(router?: Router) {
        super(router);
        this.setTitle("Profile");
    }

    render() {
        if (!AuthService.getInstance().isAuthenticated()) {
            this.router?.navigateTo("/login");
            return;
        }

        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        this.profileComponent = new ProfileComponent();
        document.body.appendChild(this.profileComponent.getContainer());
    }

    destroy() {
        console.log("Destroying ProfileView");
        this.navbar?.destroy();
        this.profileComponent?.destroy();
        document.getElementById("navbar-container")?.remove();
        document.getElementById("profile-content")?.remove();
    }
}
