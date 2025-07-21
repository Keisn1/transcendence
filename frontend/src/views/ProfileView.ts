import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import type Router from "../router.ts";
import { Profile } from "../components/profile/profile.ts";
import { AuthService } from "../services/auth/auth.service.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private profile: Profile | null = null;

    constructor(router?: Router) {
        super(router);
        this.setTitle("Profile");
    }

    render() {
        const authService = AuthService.getInstance();
        if (!authService.isAuthenticated()) {
            this.router?.navigateTo("/signup");
            return;
        }

        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        this.profile = new Profile();
        document.body.appendChild(this.profile.getContainer());
    }

    destroy() {
        console.log("Destroying ProfileView");
        this.navbar?.destroy();
        this.profile?.destroy();
        document.getElementById("navbar-container")?.remove();
        document.getElementById("profile-content")?.remove();
    }
}
