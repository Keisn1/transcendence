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

export interface MatchBody {
    player1Id: string;
    player2Id: string;
    player1Score: number;
    player2Score: number;
    gameMode: "pvp" | "ai-easy" | "ai-hard";
    duration?: number;
}

export interface GetMatchResponse {
    id: string;
    player1Id: string;
    player2Id: string;
    player1Score: number;
    player2Score: number;
    gameMode: "pvp" | "ai-easy" | "ai-hard";
    duration?: number;
    created_at: string;
}
