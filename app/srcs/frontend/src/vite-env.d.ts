/// <reference types="vite/client" />

// import type { read } from "fs";

interface ImportMetaEnv {
  // GAME GAMEPALY API
  readonly VITE_GAME_API_GAMEPLAY: string;
  readonly VITE_GAME_API_AI_GAMEPLAY: string
  readonly VITE_GAME_API_TOURNAMENT_GAMEPLAY: string;
  readonly VITE_GAME_API_LOCAL_GAMEPLAY: string;
  readonly VITE_GAME_API_LOCAL_TOURNAMENT_GAMEPLAY: string;

  // GAME MATCHING API
  readonly VITE_GAME_API_MATCHING: string;
  readonly VITE_GAME_API_TOURNAMENT_MATCHING: string;
  readonly VITE_GAME_API_AI_MATCHING: string
  readonly VITE_GAME_API_LOCAL_MATCHING: string;
  readonly VITE_GAME_API_LOCAL_TOURNAMENT_MATCHING: string

  // GAME GAMEPLAY PAGE
  readonly VITE_GAME_PATH_GAMEPLAY: string;
  readonly VITE_GAME_PATH_TOURNAMENT_GAMEPLAY: string;
  readonly VITE_GAME_PATH_AI_GAMEPLAY: string
  readonly VITE_GAME_PATH_LOCAL_GAMEPLAY: string;
  readonly VITE_GAME_PATH_LOCAL_TOURNAMENT_GAMEPLAY: string;

  // GAME MATCHING PAGE
  readonly VITE_GAME_PATH_AI_MATCHING: string
  readonly VITE_GAME_PATH_TOURNAMENT_MATCHING: string;
  readonly VITE_GAME_PATH_LOCAL_MATCHING: string
  readonly VITE_GAME_PATH_LOCAL_TOURNAMENT_MATCHING: string;

  // GAME LOADING PAGE
  readonly VITE_GAME_PATH_GAMEPLAY_LOADING: string;

  // GAME TOURNAMENT PAGE
  readonly VITE_GAME_PATH_TOURNAMENT: string;

  // GAME TOURNAMENT RESULT PAGE
  readonly VITE_GAME_PATH_TOURNAMENT_RESULT: string;

  // GAME SETTING
  readonly VITE_GAME_BOARD_WIDTH_PX: string;
  readonly VITE_GAME_BOARD_HEIGHT_PX: string;
  readonly VITE_GAME_PADDLES_HEIGHT_PX: string;
  readonly VITE_GAME_PADDLES_WIDTH_PX: string;
  readonly VITE_GAME_PADDLES_MARGIN_PX: string;
  readonly GAME_BALL_RADIUS_PX: string;
  readonly GAME_BALL_VX_PX: string;
  readonly GAME_BALL_VY_PX: string;

  // OTHER PAGE
  readonly VITE_PATH_404NOTFOUND: string;

  // API
  readonly VITE_API_AVATAR: string;
  readonly VITE_API_FETCH: string;
  readonly VITE_API_PRI_FETCH: string;
  
  // COMMON SETUPS
  readonly VITE_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}