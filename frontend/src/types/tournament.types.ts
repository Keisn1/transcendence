import { type PublicUser } from "./auth.types";

export interface Match {
    matchId: string;
    player1: PublicUser;
    player2: PublicUser;
    result: MatchResult;
}

export type MatchResult = {
    player1Score: number;
    player2Score: number;
};

export type TournamentBody = {
    tournamentId: string;
    playersId: string[];
};
