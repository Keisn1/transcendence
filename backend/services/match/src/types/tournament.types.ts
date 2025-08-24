export interface PostTournamentResponse {
    id: string;
}

export interface PostTournamentWithVerificationBody {
    playerTokens: { playerId: string; token: string }[];
}
