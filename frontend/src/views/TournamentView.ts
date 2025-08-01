import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { TournamentBracketComponent, TournamentComponent } from "../components/tournament/tournament.ts";
import type Router from "../router.ts";
import { TournamentController } from "../controllers/tournament.controller.ts";
import type { Tournament } from "../types/tournament.types.ts";
import { TournamentMachine, TournamentState } from "../components/tournament/tournament.machine.ts";
import type { BaseComponent } from "../components/BaseComponent.ts";

export default class extends AbstractView {
    private currentComponent: BaseComponent | null = null;
    private navbar: Navbar | null = null;
    private tournamentComponent: TournamentComponent | null = null;
    private tournamentController: TournamentController;

    constructor(router?: Router) {
        super(router);
        this.setTitle("Tournament");
        this.tournamentController = TournamentController.getInstance();
    }

    render() {
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        const tournament = history.state.tournament as Tournament;
        const machine = this.tournamentController.getTournamentMachine();
        if (machine) {
            this.renderByState(tournament, machine);
        } else {
            console.log("ERROR: no tournament machine initialized");
        }
    }

    private renderByState(tournament: Tournament, machine: TournamentMachine) {
        // Clean up previous component
        console.log("render tournamentView by state");
        this.currentComponent?.destroy();

        const state = machine.getState();
        switch (state) {
            case TournamentState.READY:
                console.log("rendering BracketComponent");
                this.currentComponent = new TournamentBracketComponent(tournament, machine);
                break;
            // case TournamentState.IN_PROGRESS:
            //     this.currentComponent = new TournamentMatchComponent(tournament, machine);
            //     break;
            // case TournamentState.COMPLETED:
            //     this.currentComponent = new TournamentResultsComponent(tournament);
            //     break;
        }

        document.body.appendChild(this.currentComponent.getContainer());

        // this.tournamentComponent = new TournamentComponent();
        // document.body.appendChild(this.tournamentComponent.getContainer());
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
