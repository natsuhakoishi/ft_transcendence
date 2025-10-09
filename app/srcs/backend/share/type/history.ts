import type { Leaderboard } from "../../../backend/share/type/tournamentRoomData";

export interface Player {
  user_id: number;
  username: string;
  score: number;
  avatar_path: string;
}

export interface TournamentInfo extends Leaderboard  {
  id: number;
  start_time: string;
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