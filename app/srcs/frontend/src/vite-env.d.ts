/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAMEPLAY_ROUTE: string;
  readonly VITE_GAMEMATCHING_ROUTE: string;
  readonly VITE_GAMEPLAY_HTTP_ROUTE: string;
  readonly VITE_PATH_GAMEPLAY: string;
  readonly VITE_PATH_404NOTFOUND: string;
  readonly VITE_GAME_BOARD_WIDTH_PX: number;
  readonly VITE_GAME_BOARD_HEIGHT_PX: number;
  readonly VITE_GAME_PADDLES_HEIGHT_PX: number;
  readonly VITE_GAME_PADDLES_WIDTH_PX: number;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}