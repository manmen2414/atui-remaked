import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";

export interface HandlerResult {
  handleNext: boolean;
  changeMode: boolean;
}

export class AtuiBaseFunction {
  id: string;
  enabled: boolean;
  /**
   * funcHandlerの優先順位。
   */
  priority: number;
  /**
   * 一覧上の説明。短く存在目的を伝える。
   */
  description: string = "<説明なし>";
  /**
   * 詳細説明。
   * 起動条件や注意事項を記入する。
   */
  longDescription: string =
    "<説明がないという状態はあまり好ましい設定ではない。>";

  /** ノーマルモード時funcHandler実行, 常に実行, 実行しない */
  runFuncHandlerTiming: "normal" | "alway" | "never";
  constructor(id: string, priority: number = 0) {
    this.id = id;
    this.enabled = true;
    this.priority = priority;
    this.runFuncHandlerTiming = "normal";
  }
  /**
   * `runFuncHandlerTiming`で指定された状態で質問ごとに毎回実行される
   * changeMode: true時にこの機能のモードへ転移する
   */
  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    // 未使用エラー削除用
    atui;
    resBuilder;
    return { changeMode: false, handleNext: true };
  }
  /**
   * この機能のモード時、質問ごとに毎回実行される
   * 同関数のrunFuncHandlerTimingがalwayの時はfuncHandlerの後に実行される
   * changeMode: true時に通常モードへ戻る
   */
  async funcModeHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    // 未使用エラー削除用
    atui;
    resBuilder;
    return { changeMode: true, handleNext: false };
  }
}
