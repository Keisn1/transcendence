import { BaseComponent } from "../BaseComponent.ts";
import tournamentTemplate from "./tournament.html?raw";
import matchTemplate from "./match.html?raw";
import type { Tournament, Match } from "../../types/tournament.types.ts";
import { TournamentMachine, TournamentEvent, TournamentState } from "../../controllers/tournament.machine";
import { GameComponent } from "../gameComponent/gameComponent.ts";
import { GameControlsTournamentComponent } from "../gameControls/gameControlsTournament/gameControlsTournament.ts";
import { TournamentController } from "../../controllers/tournament.controller.ts";

export class TournamentMatchComponent extends BaseComponent {
    private gameComponent: GameComponent;
    private tournamentController: TournamentController;
    private tournament: Tournament;

    constructor() {
        super("div", "tournament-container");
        this.tournamentController = TournamentController.getInstance();
        this.tournament = this.tournamentController.getTournament()!;

        this.gameComponent = new GameComponent(GameControlsTournamentComponent);
        this.container.appendChild(this.gameComponent.getContainer());

        this.gameComponent.gameControls.addToFinishCallbacks(() => {
            const result = this.gameComponent!.getResult();
            const matchIndex = this.tournament.matches.findIndex((m: Match) => !m.result)!;
            this.tournament.matches[matchIndex].result = result;

            console.log(result);
            console.log(this.tournament.matches[matchIndex].result);

            this.tournamentController.finishMatch(result);
        });
    }
    destroy(): void {
        this.gameComponent.destroy();
        super.destroy();
    }
}

export class TournamentComponent extends BaseComponent {
    // elements
    private headerElement: HTMLElement;
    private nextWrapperElement: HTMLElement;
    private nextDetailsElement: HTMLElement;
    private startBtnElement: HTMLButtonElement;
    private allMatchesWrapperElement: HTMLElement;
    private listElement: HTMLUListElement;
    // states
    private machine!: TournamentMachine;
    private gameComponent?: GameComponent;

    constructor() {
        super("div", "tournament-container");
        this.container.innerHTML = tournamentTemplate;

        this.headerElement = this.container.querySelector("#tournament-header")!;
        this.nextWrapperElement = this.container.querySelector("#next-match-wrapper")!;
        this.nextDetailsElement = this.container.querySelector("#next-match-details")!;
        this.startBtnElement = this.container.querySelector("#start-match-btn")!;
        this.allMatchesWrapperElement = this.container.querySelector("#all-matches-wrapper")!;
        this.listElement = this.container.querySelector("#matches-list")!;

        this.loadAndRender();
    }

    private async loadAndRender() {
        const tournament = history.state.tournament as Tournament;
        this.machine = new TournamentMachine(tournament.matches);

        this.machine.update(TournamentEvent.LOAD);
        this.renderByState(tournament);
    }

    private async renderByState(tournament: Tournament): Promise<void> {
        const state = this.machine.getState();

        this.headerElement.style.display = "none";
        this.startBtnElement.style.display = "none";
        this.nextWrapperElement.style.display = "none";
        this.allMatchesWrapperElement.style.display = "none";

        switch (state) {
            case TournamentState.READY:
                this.handleReadyState(tournament);
                break;

            case TournamentState.IN_PROGRESS:
                this.handleInProgressState(tournament);
                break;

            case TournamentState.MATCH_DONE:
                this.handleMatchDoneState(tournament);
                break;

            case TournamentState.COMPLETED:
                this.handleCompletedState(tournament);
                break;

            default:
                break;
        }
    }

    private handleReadyState(tournament: Tournament): void {
        this.headerElement.style.display = "";
        this.startBtnElement.style.display = "";
        this.nextWrapperElement.style.display = "";
        this.allMatchesWrapperElement.style.display = "";
        this.renderList(tournament.matches);
        this.nextDetailsElement.textContent = "Ready to start first match";
        this.startBtnElement.disabled = false;
        this.startBtnElement.onclick = () => {
            this.machine.update(TournamentEvent.START);
            this.renderByState(tournament);
        };
    }

    private handleInProgressState(tournament: Tournament): void {
        this.nextDetailsElement.textContent = `Playing: ${this.nextMatchLabel(tournament)}`;

        if (!this.gameComponent) {
            const placeholder = this.container.querySelector("#game-container-placeholder")!;
            this.gameComponent = new GameComponent(GameControlsTournamentComponent);
            placeholder.appendChild(this.gameComponent.getContainer());

            if (this.gameComponent.gameControls.addToFinishCallbacks) {
                this.gameComponent.gameControls.addToFinishCallbacks(() => {
                    const winner = this.gameComponent!.getResult();
                    const matchIndex = tournament.matches.findIndex((m) => !m.result)!;
                    tournament.matches[matchIndex].result = winner;

                    console.log(winner);
                    console.log(tournament.matches[matchIndex].result);

                    this.gameComponent?.destroy();
                    this.gameComponent = undefined;
                    this.machine.update(TournamentEvent.FINISH);
                    this.renderByState(tournament);
                });
            }
        }
    }

    private handleMatchDoneState(tournament: Tournament): void {
        this.headerElement.style.display = "";
        this.startBtnElement.style.display = "";
        this.nextWrapperElement.style.display = "";
        this.allMatchesWrapperElement.style.display = "";
        this.startBtnElement.textContent = this.machine.hasMoreMatches() ? "Next Match" : "See Results";
        this.startBtnElement.disabled = false;
        this.nextDetailsElement.textContent = "Last result recorded";
        this.startBtnElement.onclick = () => {
            this.machine.update(TournamentEvent.NEXT);
            this.renderByState(tournament);
        };
    }

    private handleCompletedState(tournament: Tournament): void {
        this.renderList(tournament.matches);
        this.nextDetailsElement.textContent = "Tournament Complete!";
    }

    private renderList(matches: Match[]) {
        this.listElement.innerHTML = "";
        matches.forEach((m: Match) => {
            const status: string = `${m.result?.player1Score} : ${m.result?.player2Score}`;
            const html = matchTemplate
                .replace(/{{player1}}/g, m.player1.username)
                .replace(/{{player2}}/g, m.player2.username)
                .replace(/{{status}}/g, status);
            this.listElement.insertAdjacentHTML("beforeend", html);
        });
    }

    private nextMatchLabel(tournament: Tournament) {
        const next = tournament.matches.find((m) => !m.result)!;
        return `${next.player1.username} vs ${next.player2.username ?? "BYE"}`;
    }

    destroy(): void {
        super.destroy();
    }
}
