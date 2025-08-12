import { type RealPublicUser } from "./auth.types";
import type { GameMode } from "./game.types";

export interface Match {
    matchId: string;
    player1: RealPublicUser;
    player2: RealPublicUser;
    result: MatchResult;
}

export type MatchResult = {
    player1Score: number;
    player2Score: number;
};

export interface PostMatchBody {
    player1Id: string;
    player2Id: string;
    player1Score: number;
    player2Score: number;
    gameMode: GameMode;
    duration?: number;
    tournamentId: string; // either "" or proper id, maybe "?" not needed
}

export interface GetMatchResponse {
    id: string;
    player1Id: string;
    player2Id: string;
    player1Score: number;
    player2Score: number;
    gameMode: GameMode;
    duration?: number;
    created_at: string;
}
