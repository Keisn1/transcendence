import { BaseComponent } from "../BaseComponent.ts";
import tournamentTemplate from "./tournament.html?raw";
import tournamentBracketTemplate from "./tournamentBracket.html?raw";
import matchTemplate from "./match.html?raw";
import type { Tournament, Match } from "../../types/tournament.types.ts";
import { TournamentMachine, TournamentEvent, TournamentState } from "./tournament.machine.ts";
import { GameComponent } from "../gameComponent/gameComponent.ts";
import { GameControlsTournamentComponent } from "../gameControls/gameControlsTournament/gameControlsTournament.ts";

export class TournamentBracketComponent extends BaseComponent {
    private tournament: Tournament;
    private machine!: TournamentMachine;
    private matchList: HTMLUListElement;
    private nextMatchDetails: HTMLElement;

    constructor(tournament: Tournament, machine: TournamentMachine) {
        super("div", "tournament-container");
        console.log("constructing bracket component");
        this.container.innerHTML = tournamentBracketTemplate;
        this.tournament = tournament;
        this.machine = machine;

        this.matchList = this.container.querySelector("#matches-list")!;
        this.nextMatchDetails = this.container.querySelector("#next-match-details")!;

        this.populateData();
    }
    private populateData() {
        this.fillMatchList();
        this.fillNextMatchDetails();
    }

    private fillMatchList() {
        this.tournament.matches.forEach((m) => {
            const status = m.result ?? "Pending";
            const html = matchTemplate
                .replace(/{{player1}}/g, m.player1.username)
                .replace(/{{player2}}/g, m.player2.username)
                .replace(/{{status}}/g, status);
            this.matchList.insertAdjacentHTML("beforeend", html);
        });
    }
    private fillNextMatchDetails() {
        switch (this.machine.getState()) {
            case TournamentState.READY:
                this.nextMatchDetails.textContent = "Ready to start first match";
                break;
            case TournamentState.IN_PROGRESS:
                this.nextMatchDetails.textContent = `Playing: ${this.nextMatchLabel()}`;
                break;
            case TournamentState.MATCH_DONE:
                this.nextMatchDetails.textContent = "Last result recorded";
                break;
            case TournamentState.COMPLETED:
                this.nextMatchDetails.textContent = "Tournament Complete!";
                break;
        }
    }

    private nextMatchLabel() {
        // TODO: bit strange, maybe a method on the tournament itself
        const next = this.tournament.matches.find((m) => !m.result)!;
        return `${next.player1.username} vs ${next.player2.username ?? "BYE"}`;
    }

    destroy(): void {
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

            if (this.gameComponent.gameControls.onFinish) {
                this.gameComponent.gameControls.onFinish(() => {
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
        matches.forEach((m) => {
            const status = m.result ?? "Pending";
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
