import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { TournamentSignup } from "../components/tournament/tournament.ts";
import type Router from "../router.ts";

export default class extends AbstractView {
    private navbar: Navbar | null = null;
    private tournamentSignup: TournamentSignup | null = null;

    constructor(router?: Router) {
        super(router);
        this.setTitle("Pong Tournament Signup");
    }

    render() {
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        this.tournamentSignup = new TournamentSignup();
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
