export interface Account {
  user_id: number;
  username: string;
  email: string;
  google_login: boolean,
  created_at: string;
}

export interface Profile {
  avatar_path: string | null;
  avatar_buffer?: string;
  avatar_buffer_exist: boolean;
  login_status: number;
  win_games: number;
  lose_games: number;
  tournament_wins: number;
}

export interface User {
  acc: Account;
  profile: Profile;
}