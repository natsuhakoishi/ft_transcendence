export interface DBMatchData {
    id: number;
    player1_id: number;
    player2_id: number;
    player1_score: number;
    player2_score: number;
    winner_id: number;
    tournament_flag: number;
    game_time: string;
    player1_username: string;
    player2_username: string;
}