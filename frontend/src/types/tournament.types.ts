import { type User } from "./auth.types";

export interface RegisterPlayerBody {
    playerEmail: string;
    playerPassword: string;
}

export interface Match {
    matchId: string;
    player1: User;
    player2: User;
    // round: number;
    result: GameResult;
}

export type GameResult = {
    player1Score: number;
    player2Score: number;
};
