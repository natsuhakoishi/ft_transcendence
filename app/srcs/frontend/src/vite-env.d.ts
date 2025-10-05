/// <reference types="vite/client" />

// import type { read } from "fs";

interface ImportMetaEnv {
  readonly VITE_GAMEPLAY_ROUTE: string;
  readonly VITE_GAME_MATCHING_ROUTE: string;
  readonly VITE_GAME_TOURNAMENT_GAMEPLAY_ROUTE: string;
  readonly VITE_GAME_TOURNAMENT_MATCHING_ROUTE: string;

  readonly VITE_PATH_TOURNAMENT: string;
  readonly VITE_PATH_TOURNAMENT_GAMEPLAY: string;
  readonly VITE_PATH_TOURNAMENT_RESULT: string;
  readonly VITE_PATH_TOURNAMENT_MATCHING: string;
  readonly VITE_PATH_GAMEPLAY: string;
  readonly VITE_PATH_GAMEPLAY_LOADING: string;
  readonly VITE_PATH_404NOTFOUND: string;

  readonly VITE_GAME_BOARD_WIDTH_PX: string;
  readonly VITE_GAME_BOARD_HEIGHT_PX: string;
  readonly VITE_GAME_PADDLES_HEIGHT_PX: string;
  readonly VITE_GAME_PADDLES_WIDTH_PX: string;
  readonly VITE_GAME_PADDLES_MARGIN_PX: string;

  readonly VITE_API_GOOGLE_AUTH: string;
  readonly VITE_API_AVATAR: string;
  readonly VITE_API_FETCH: string;
  readonly VITE_API_PRI_FETCH: string;

  readonly VITE_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}