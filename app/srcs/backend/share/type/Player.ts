export interface Player {
    id: number;
    ws?: any;
}

export interface PlayerWithProfileData extends Player {
    avatar?: string;
    name?: string;
}