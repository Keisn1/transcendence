import { type Tournament } from "../types/tournament.types";
import { tournamentHasMoreMatches } from "./utils";

export enum TournamentState {
    UNINITIALIZED = "uninitialized",
    READY = "ready", // bracket is loaded, before any match
    IN_PROGRESS = "in_progress", // a match is live
    MATCH_DONE = "match_done", // just finished a match, before user clicks “Next”
    COMPLETED = "completed", // all matches finished
}

export enum TournamentEvent {
    LOAD = "LOAD", // tournament data arrives
    START = "START", // user clicks “Start match”
    FINISH = "FINISH", // match finishes (service/event)
    NEXT = "NEXT", // user clicks “Next match”
}

type Transition = {
    from: TournamentState;
    on: TournamentEvent;
    to: TournamentState;
};

const transitions: Transition[] = [
    { from: TournamentState.UNINITIALIZED, on: TournamentEvent.LOAD, to: TournamentState.READY },
    { from: TournamentState.READY, on: TournamentEvent.START, to: TournamentState.IN_PROGRESS },
    { from: TournamentState.IN_PROGRESS, on: TournamentEvent.FINISH, to: TournamentState.READY },
    { from: TournamentState.IN_PROGRESS, on: TournamentEvent.FINISH, to: TournamentState.COMPLETED },
    // { from: TournamentState.IN_PROGRESS, on: TournamentEvent.FINISH, to: TournamentState.MATCH_DONE },
    // { from: TournamentState.MATCH_DONE, on: TournamentEvent.NEXT, to: TournamentState.IN_PROGRESS },
    // { from: TournamentState.MATCH_DONE, on: TournamentEvent.NEXT, to: TournamentState.COMPLETED },
];

export class TournamentMachine {
    private state: TournamentState = TournamentState.UNINITIALIZED;

    public update(event: TournamentEvent, tournament: Tournament): void {
        const tx = transitions.find((t) => t.from === this.state && t.on === event);
        if (!tx) {
            console.warn(`Invalid transition from ${this.state} on ${event}`);
            return;
        }

        console.log("here: ", tournamentHasMoreMatches(tournament));
        if (
            tx.from === TournamentState.IN_PROGRESS &&
            event === TournamentEvent.FINISH &&
            !tournamentHasMoreMatches(tournament)
        ) {
            this.state = TournamentState.COMPLETED;
        } else {
            this.state = tx.to;
        }
    }

    public getState() {
        return this.state;
    }
}
