import { type Match, type Tournament } from "../types/tournament.types";

// TODO: find a better way, maybe tournament class
export function tournamentHasMoreMatches(tournament: Tournament) {
    return tournament.matches.some((m: Match) => {
        return m.result === undefined;
    });
}
