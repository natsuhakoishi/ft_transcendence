/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAMEPLAY_ROUTE: string;
  readonly VITE_GAME_MATCHING_ROUTE: string;
  readonly VITE_GAME_TOURNAMENT_MATCHING_ROUTE: string;

  readonly VITE_PATH_TOURNAMENT_GAMEPLAY: string
  readonly VITE_PATH_TOURNAMENT_MATCHING: string
  readonly VITE_PATH_GAMEPLAY: string;
  readonly VITE_PATH_404NOTFOUND: string;

  readonly VITE_GAME_BOARD_WIDTH_PX: string;
  readonly VITE_GAME_BOARD_HEIGHT_PX: string;
  readonly VITE_GAME_PADDLES_HEIGHT_PX: string;
  readonly VITE_GAME_PADDLES_WIDTH_PX: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}