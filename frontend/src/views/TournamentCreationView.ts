import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { TournamentCreation } from "../components/tournamentCreation/tournamentCreation.ts";
import type Router from "../router.ts";
import { AuthService } from "../services/auth/auth.service.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private tournamentSignup: TournamentCreation | null = null;

    constructor(router?: Router) {
        super(router);
        this.setTitle("Pong Tournament Signup");
    }

    render() {
        const authService = AuthService.getInstance();
        if (!authService.isAuthenticated()) {
            this.router?.navigateTo("/login");
            return;
        }
        
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        this.tournamentSignup = new TournamentCreation();
        document.body.appendChild(this.tournamentSignup.getContainer());
    }

    destroy() {
        this.navbar?.destroy();
        this.tournamentSignup?.destroy();

        document.getElementById("navbar-container")?.remove();
        document.getElementById("tournament-container")?.remove();

        this.navbar = null;
        this.tournamentSignup = null;
    }
}
