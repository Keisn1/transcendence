import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { TournamentComponent } from "../components/tournament/tournament.ts";
import type Router from "../router.ts";
// import type { Tournament } from "../types/tournament.types.ts";


export default class extends AbstractView {
	private navbar: Navbar | null = null;
	private tournamentComponent: TournamentComponent | null = null;

	constructor(router?: Router) {
		super(router);
		this.setTitle("Tournament");
	}

	render() {
		this.navbar = new Navbar();
		document.body.appendChild(this.navbar.getContainer());

		this.tournamentComponent = new TournamentComponent();
		document.body.appendChild(this.tournamentComponent.getContainer());
	}

	destroy() {
		this.navbar?.destroy();
		this.tournamentComponent?.destroy();

		document.getElementById("navbar-container")?.remove();
		document.getElementById("tournament-container")?.remove();

		this.navbar = null;
		this.tournamentComponent = null;
  	}
}
