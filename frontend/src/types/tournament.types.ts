export interface RegisterPlayerBody {
	playerEmail: string,
	playerPassword: string,
}

export interface User {
	id: string;
	username: string;
	email: string;
	avatar?: string;
}

export interface TournamentCreationBody {
	userIds: string[];
	// players?: User[];
}

export interface Tournament {
	id: string;
	playerIds: string[];
	players?: User[];
	bracket: Match[];
	state: string;
}

export interface Match {
	matchId: string;
	// player1Id: string;
	// player2Id: string;
	player1: User;
	player2: User;
	round: number;
	result?: string;
}
