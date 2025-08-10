export interface MatchBody {
    player1Id: string;
    player2Id: string;
    player1Score: number;
    player2Score: number;
    gameMode: "pvp" | "ai-easy" | "ai-hard";
    duration?: number;
}
