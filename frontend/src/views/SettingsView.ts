import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { Settings } from "../components/settings/settings.component.ts";
import { AuthService } from "../services/auth/auth.service.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private settings: Settings | null = null;

    constructor(router?: any) {
        super(router);
        this.setTitle("Settings");
    }

    render() {
        if (!AuthService.getInstance().isAuthenticated()) {
            this.router?.navigateTo("/login");
            return;
        }
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        this.settings = new Settings();
        document.body.appendChild(this.settings.getContainer());
    }

    destroy() {
        this.navbar?.destroy();
        this.settings?.destroy();
        document.getElementById("navbar-container")?.remove();
        document.getElementById("settings-container")?.remove();
        this.navbar = null;
        this.settings = null;
    }
}
