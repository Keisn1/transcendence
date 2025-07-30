import type { Match } from "../../types/tournament.types.ts";

export enum BracketState {
	UNINITIALIZED = "uninitialized",
	READY = "ready",					// bracket is loaded, before any match
	IN_PROGRESS = "in_progress",		// a match is live
	MATCH_DONE = "match_done",			// just finished a match, before user clicks “Next”
	COMPLETED = "completed",			// all matches finished
}

export enum BracketEvent {
	LOAD = "LOAD",			// tournament data arrives
	START = "START",		// user clicks “Start match”
	FINISH = "FINISH",		// match finishes (service/event)
	NEXT = "NEXT",			// user clicks “Next match”
}

type Transition = {
	from: BracketState;
	on: BracketEvent;
	to: BracketState;
};

const transitions: Transition[] = [
	{ from: BracketState.UNINITIALIZED,	on: BracketEvent.LOAD,		to: BracketState.READY },
	{ from: BracketState.READY,			on: BracketEvent.START,		to: BracketState.IN_PROGRESS },
	{ from: BracketState.IN_PROGRESS,	on: BracketEvent.FINISH,	to: BracketState.MATCH_DONE },
	{ from: BracketState.MATCH_DONE,	on: BracketEvent.NEXT,		to: BracketState.IN_PROGRESS },
	{ from: BracketState.MATCH_DONE,	on: BracketEvent.NEXT, 		to: BracketState.COMPLETED },
];


export class BracketMachine {
	private state: BracketState = BracketState.UNINITIALIZED;
	private bracket: Match[];

	constructor(bracket: Match[]) {
		this.bracket = bracket;
	}

	public send(event: BracketEvent): void {
		const tx = transitions.find(t => t.from === this.state && t.on === event);
		if (!tx) {
			console.warn(`Invalid transition from ${this.state} on ${event}`);
			return;
		}

		if (
			tx.from === BracketState.MATCH_DONE &&
			event === BracketEvent.NEXT &&
			!this.hasMoreMatches()
		) {
			this.state = BracketState.COMPLETED;
		} else {
			this.state = tx.to;
		}
	}

	public getState() {
		return this.state;
	}

	public hasMoreMatches(): boolean {
		return this.bracket.some(m => !m.result);
	}
}

