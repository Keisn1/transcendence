import { type PublicUser } from "./auth.types";

export interface Match {
    matchId: string;
    player1: PublicUser;
    player2: PublicUser;
    result: GameResult;
}

export type GameResult = {
    player1Score: number;
    player2Score: number;
};

export type TournamentBody = {
    tournamentId: string;
    playersId: string[];
}
