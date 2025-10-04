export interface Profile {
    id: number;
    username: string;
    avatar_path: string;
    avatar_buffer: Buffer | null;
    login_status: number;
    win_games: number;
    lose_games: number;
    tournament_wins: number;
}