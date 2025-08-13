import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import type Router from "../router.ts";
import { AuthService } from "../services/auth/auth.service.ts";
import { UserContent } from "../components/userContent/userContent.component.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private userContent: UserContent | null = null;

    constructor(router?: Router) {
        super(router);
        this.setTitle("User");
    }

    render() {
        if (!AuthService.getInstance().isAuthenticated()) {
            this.router?.navigateTo("/login");
            return;
        }

        // TODO: erik: super hardcoded, I guess there should be something like this.router.getParam()
        const userId = "36a67ec1-cd9b-4f9d-974a-807051e1dab8";

        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        this.userContent = new UserContent(userId);
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
