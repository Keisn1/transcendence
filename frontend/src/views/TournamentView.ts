import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { TournamentBracketComponent } from "../components/tournamentBracket/tournamentBracket.ts";
import { TournamentMatchComponent } from "../components/tournamentMatch/tournamentMatch.ts";
import type Router from "../router.ts";
import { TournamentController } from "../controllers/tournament.controller.ts";
import { TournamentState } from "../controllers/tournament.machine.ts";
import type { BaseComponent } from "../components/BaseComponent.ts";
import { TournamentCreation } from "../components/tournamentCreation/tournamentCreation.ts";
import { TournamentFinalComponent } from "../components/tournamentFinal/tournamentFinal.ts";

export default class extends AbstractView {
    private currentComponent: BaseComponent | null = null;
    private navbar: Navbar | null = null;
    private tournamentController: TournamentController;

    constructor(router?: Router) {
        super(router);
        this.setTitle("Tournament");
        this.tournamentController = TournamentController.getInstance();
    }

    render() {
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        this.renderByState();
    }

    private renderByState() {
        // Clean up previous component
        console.log("render tournamentView by state");
        this.currentComponent?.destroy();

        const state = this.tournamentController.getTournamentMachine().getState();
        switch (state) {
            case TournamentState.UNINITIALIZED:
                this.currentComponent = new TournamentCreation();
                break;
            case TournamentState.READY:
                console.log("rendering BracketComponent");
                this.currentComponent = new TournamentBracketComponent();
                break;
            case TournamentState.IN_PROGRESS:
                this.currentComponent = new TournamentMatchComponent();
                break;
            case TournamentState.COMPLETED:
                this.currentComponent = new TournamentFinalComponent();
                break;
        }

        if (this.currentComponent) {
            document.body.appendChild(this.currentComponent.getContainer());
        }
    }

    destroy() {
        this.navbar?.destroy();
        this.currentComponent?.destroy();

        document.getElementById("navbar-container")?.remove();
        document.getElementById("tournament-container")?.remove();

        this.navbar = null;
        this.currentComponent = null;
    }
}
