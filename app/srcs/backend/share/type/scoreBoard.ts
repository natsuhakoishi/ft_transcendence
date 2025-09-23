export interface ScoreBoard {
    r1a: number;
    r1b: number;
    r1c: number;
    r1d: number;

    r2a?: number;
    r2b?: number;
    r2c?: number;
    r2d?: number;

    first?: number;
    second?: number;
    third?: number;
    last?: number;

    r1AGroupScore?: number[];
    r1BGroupScore?: number[];
    r2AGroupScore?: number[];
    r2BGroupScore?: number[];
}