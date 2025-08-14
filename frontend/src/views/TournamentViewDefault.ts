import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { TournamentBracketComponent } from "../components/tournament/tournamentBracket/tournamentBracket.ts";
import { TournamentMatchComponent } from "../components/tournament/tournamentMatch/tournamentMatch.ts";
import type Router from "../router.ts";
import { TournamentController } from "../controllers/tournament.controller.ts";
import { TournamentState } from "../controllers/tournament.machine.ts";
import { type BaseComponent } from "../components/BaseComponent.ts";
import { TournamentCreation } from "../components/tournament/tournamentCreation/tournamentCreation.ts";
import { TournamentFinalComponent } from "../components/tournament/tournamentFinal/tournamentFinal.ts";

export default class extends AbstractView {
    private currentComponent: BaseComponent | null = null;
    private navbar: Navbar | null = null;
    private tournamentController: TournamentController;
    private unloadHandler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
    };

    constructor(router?: Router, params?: any) {
        super(router, params);
        this.setTitle("Tournament");
        this.tournamentController = TournamentController.getInstance(router);
    }

    render() {
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        window.addEventListener("beforeunload", this.unloadHandler);

        this.renderByState();
    }

    private renderByState() {
        // Clean up previous component
        console.log("render tournamentViewDefault by state");
        this.currentComponent?.destroy();

        console.log(
            "Tournament being rendered with tournamentDefault: ",
            this.tournamentController.getTournamentDefault(),
        );
        console.log("matches results", this.tournamentController.getTournamentDefault()?.matches[0]?.result);
        const state = this.tournamentController.getTournamentMachineDefault().getState();
        switch (state) {
            case TournamentState.UNINITIALIZED:
                this.currentComponent = new TournamentCreation(true);
                break;
            case TournamentState.READY:
                this.currentComponent = new TournamentBracketComponent(true);
                break;
            case TournamentState.IN_PROGRESS:
                this.currentComponent = new TournamentMatchComponent(true);
                break;
            case TournamentState.COMPLETED:
                this.currentComponent = new TournamentFinalComponent(true);
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

        window.removeEventListener("beforeunload", this.unloadHandler);
    }
}
