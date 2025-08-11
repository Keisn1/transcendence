export interface PostMatchBody {
    player1Id: string;
    player2Id: string;
    player1Score: number;
    player2Score: number;
    gameMode: "pvp" | "ai-easy" | "ai-hard" | "tournament";
    duration?: number;
}

export interface GetMatchResponse {
    id: string;
    player1Id: string;
    player2Id: string;
    player1Score: number;
    player2Score: number;
    gameMode: "pvp" | "ai-easy" | "ai-hard" | "tournament";
    duration?: number;
    created_at: "string";
}
