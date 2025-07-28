import type { TournamentCreationBody } from "../../types/tournament.types.ts";

export class TournamentService {
    private static instance: TournamentService;

    private constructor() {
        // this.loadUserFromStorage();
    }

    static getInstance(): TournamentService {
        if (!TournamentService.instance) {
            TournamentService.instance = new TournamentService();
        }
        return TournamentService.instance;
    }

    async register(usersCredentials: TournamentCreationBody): Promise<void> {
        console.log(usersCredentials);
    }
}
