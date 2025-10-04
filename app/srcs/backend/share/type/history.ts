interface Player {
  user_id: number;
  username: string;
  score: number;
}

interface TournamentInfo {
  id: number;
  start_time: string;
  //feat expand into leaderboard(ranking)
}

export interface TournamentMatch {
  // mode: "tournament";
  tournament: TournamentInfo;
  matches: Match[];
}

export interface Match {
  mode: "match" | "tournament";
  match_id: number;
  game_time: string;
  winner_id: number;

  player1: Player;
  player2: Player;
}

export interface MatchMeResponse {
  user_id: number;
  user_matches: ( | Match | TournamentMatch)[];
}