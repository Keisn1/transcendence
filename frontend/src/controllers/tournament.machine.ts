import { type Match } from "../types/tournament.types";

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
    { from: TournamentState.IN_PROGRESS, on: TournamentEvent.FINISH, to: TournamentState.MATCH_DONE },
    { from: TournamentState.MATCH_DONE, on: TournamentEvent.NEXT, to: TournamentState.IN_PROGRESS },
    { from: TournamentState.MATCH_DONE, on: TournamentEvent.NEXT, to: TournamentState.COMPLETED },
];

export class TournamentMachine {
    private state: TournamentState = TournamentState.UNINITIALIZED;
    private matches: Match[];

    constructor(matches: Match[]) {
        // TODO: not sharing the same match
        this.matches = matches;
    }

    public update(event: TournamentEvent): void {
        const tx = transitions.find((t) => t.from === this.state && t.on === event);
        if (!tx) {
            console.warn(`Invalid transition from ${this.state} on ${event}`);
            return;
        }

        if (tx.from === TournamentState.MATCH_DONE && event === TournamentEvent.NEXT && !this.hasMoreMatches()) {
            this.state = TournamentState.COMPLETED;
        } else {
            this.state = tx.to;
        }
    }

    public getState() {
        return this.state;
    }

    public hasMoreMatches(): boolean {
        return this.matches.some((m: Match) => !m.result);
    }
}
