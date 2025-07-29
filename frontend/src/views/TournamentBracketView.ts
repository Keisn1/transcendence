import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { TournamentSignup } from "../components/tournament/tournament.ts";
import type Router from "../router.ts";

export default class TournamentBracketView extends AbstractView {
    // private navbar: Navbar | null = null;
	// private tournamentId: string;
	// private tournamentService = TournamentService.getInstance();

	// constructor(router: Router) {
	// 	super(router);
	// 	this.tournamentId = this.router.currentParams.id;
	// }

	// async render() {
	// 	this.navbar = new Navbar();
    //     document.body.appendChild(this.navbar.getContainer());

	// 	const tournament = await this.tournamentService.getTournament(this.tournamentId);
	// 	this.container.innerHTML = bracketTemplate(tournament);
	// }

	// destroy() {
    //     this.navbar?.destroy();
    //     // this.tournamentSignup?.destroy();

    //     document.getElementById("navbar-container")?.remove();
    //     document.getElementById("tournament-container")?.remove();

    //     this.navbar = null;
    //     // this.tournamentSignup = null;
    // }
}
