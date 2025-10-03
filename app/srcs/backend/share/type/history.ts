interface Player {
  user_id: number;
  username: string;
  score: number;
}

interface TournamentInfo {
  id: number | null;
  //feat expand into leaderboard(ranking)
}

interface Match {
  match_id: number;
  game_time: string;
  winner_id: number;

  player1: Player;
  player2: Player;

  tournament: TournamentInfo;
}

export interface MatchMeResponse {
  user_id: number;
  user_matches: Match[];
}