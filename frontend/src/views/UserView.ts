import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import type Router from "../router.ts";
import { AuthService } from "../services/auth/auth.service.ts";
import { UserContent } from "../components/userContent/userContent.component.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private userContent: UserContent | null = null;

    constructor(router?: Router, params?: any) {
        super(router, params);
        console.log(params);
        this.setTitle("User");
    }

    render() {
        if (!AuthService.getInstance().isAuthenticated()) {
            this.router?.navigateTo("/login");
            return;
        }

        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        if (!this.params) {
            console.log("no parameters give");
            return;
        }
        if (!("id" in this.params)) {
            console.log("no id in params");
        }

        this.userContent = new UserContent(this.params.id);
        document.body.appendChild(this.userContent.getContainer());
    }

    destroy() {
        console.log("Destroying UserView");
        this.navbar?.destroy();
        this.userContent?.destroy();
        document.getElementById("navbar-container")?.remove();
        document.getElementById("dashboard-content")?.remove();
    }
}
