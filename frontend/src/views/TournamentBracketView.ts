import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { TournamentBracket } from "../components/tournamentBracket/tournamentBracket.ts";
import type Router from "../router.ts";
// import type { Tournament } from "../types/tournament.types.ts";


export default class extends AbstractView {
	private navbar: Navbar | null = null;
	private bracketComponent: TournamentBracket | null = null;

	constructor(router?: Router) {
		super(router);
		this.setTitle("Tournament Bracket");
	}

	render() {
		this.navbar = new Navbar();
		document.body.appendChild(this.navbar.getContainer());

		// let tournament: Tournament | null = history.state?.initial ?? null; // TODO: 

		this.bracketComponent = new TournamentBracket();
		document.body.appendChild(this.bracketComponent.getContainer());
	}

	destroy() {
		this.navbar?.destroy();
		this.bracketComponent?.destroy();

		document.getElementById("navbar-container")?.remove();
		document.getElementById("tournament-bracket-container")?.remove();

		this.navbar = null;
		this.bracketComponent = null;
  }
}
