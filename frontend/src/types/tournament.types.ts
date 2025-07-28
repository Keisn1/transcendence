export interface TournamentCreationBody { // TODO: better body
	player1Id?: string,
	player2Id?: string,
	player3Id?: string,
	player4Id?: string,
}

export interface RegisterPlayerBody {
	playerEmail: string,
	playerPassword: string,
}