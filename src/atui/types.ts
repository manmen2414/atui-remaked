export type AtuiModes =
  | "normal"
  | "weather"
  | "qr"
  | "post"
  | "game"
  | "noFire";

export type AtuiSafeResponse =
  | AtuiMarkdownResponse
  | AtuiErrorResponse
  | AtuiBlankResponse;

export type AtuiResponse =
  | AtuiSafeResponse
  | AtuiOpenPageResponse
  | AtuiCustomResponse;

export interface AtuiBaseResponse {
  type: string;
  request: AtuiRequest;
  requestId: number;
  finish: boolean;
}
export interface AtuiMarkdownResponse extends AtuiBaseResponse {
  type: "md";
  content: string;
}
export interface AtuiErrorResponse extends AtuiBaseResponse {
  type: "error";
  content: string;
}
export interface AtuiOpenPageResponse extends AtuiBaseResponse {
  type: "page";
  url: string;
  target: "replace" | "newpage" | "popup";
  popupInfo?: {
    title?: string;
    features?: string;
  };
}
export interface AtuiBlankResponse extends AtuiBaseResponse {
  type: "blank";
}
export interface AtuiCustomResponse extends AtuiBaseResponse {
  type: "custom";
  /** contentをシリアライズできる場合はtrueにするとよい。 */
  serialiseable: boolean;
  customId: string;
  content: any;
}

export interface AtuiRequest {
  id: number;
  content: string;
}

export interface AtuiRunnableGame {
  onAtuiMessage(content: string): {
    response: string | AtuiSafeResponse;
    state: AtuiGameFlagType;
  };
}

export enum AtuiGameFlagType {
  ERROR = -2,
  CANCELED = -1,
  CONTINUE = 0,
  USER_WIN = 1,
  USER_LOSE = 2,
}
