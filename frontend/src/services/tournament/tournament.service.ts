import { Tournament } from "../../controllers/tournament.controller.ts";
import { type TournamentBody } from "../../types/tournament.types.ts";
import { AuthStorage } from "../auth/auth.storage.ts";

export class TournamentService {
    private static instance: TournamentService;

    private constructor() {}

    static getInstance(): TournamentService {
        if (!TournamentService.instance) {
            TournamentService.instance = new TournamentService();
        }
        return TournamentService.instance;
    }

    async createTournament(tournament: Tournament): Promise<void> {
        const tournamentBody: TournamentBody = {
            tournamentId: tournament.id,
            playersId: tournament.players.map((player) => player.id),
        };

        // const response = await fetch("/api/tournament", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //         Authorization: `Bearer ${AuthStorage.getToken()}`,
        //     },
        //     body: JSON.stringify(tournamentBody),
        // });

        // if (!response.ok) {
        //     const errMsg = await response.text();
        //     throw new Error(`Failed to save tournament: ${errMsg}`);
        // }
    }
}
