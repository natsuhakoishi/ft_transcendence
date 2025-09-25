export interface Profile {
	f_id: number,
	friend_username: string,
	friend_avatar_path: string | null,
	friend_avatar_buffer?: string,
	friend_avatar_buffer_exist: boolean,
	friend_login_status: string,
	friend_win_games: number,
	friend_lose_games: number,
	friend_tournament_wins: number,
}

export interface Status {
	mutual: { mutual: boolean, message: string};
}

export interface Friend {
	info: Profile;
	status: Status;
}