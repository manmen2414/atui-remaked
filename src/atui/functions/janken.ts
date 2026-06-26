import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";
import { AtuiGameFlagType } from "../types";

export class AtuiJanken {
  constructor() {}
  onAtuiMessage(content: string) {
    const hands = ["グー", "チョキ", "パー", "ぐー", "ちょき", "ぱー"];
    const resultFlag = [
      AtuiGameFlagType.USER_WIN,
      AtuiGameFlagType.USER_LOSE,
      AtuiGameFlagType.CONTINUE,
    ];
    const resultText = [
      "あなたの勝ちです。",
      "あなたの負けです。",
      "あいこです。もう一回！",
    ];
    if (content.includes("目つぶし")) {
      return {
        response: `ぁ”ッーーーー\n` + resultText[0],
        state: resultFlag[0],
      };
    }
    const plHand = hands.findIndex((s) => content.includes(s)) % 3;
    if (plHand === -1) {
      return {
        response: `じゃんけんですかそれ\n` + resultText[1],
        state: resultFlag[1],
      };
    }
    const cpHand = Math.floor(Math.random() * 3);
    const result = (2 - plHand + cpHand) % 3;
    return {
      response: `私は${hands[cpHand]}を出しました。\n` + resultText[result],
      state: resultFlag[result],
    };
  }
}

export class JankenFunction extends AtuiBaseFunction {
  description: string = `Atuiとじゃんけんしましょう！`;
  longDescription: string = `「じゃんけん」と言えば起動します。\nグー, チョキ, パーのいずれかを使うことができますし、それ以外だと基本負けます。なぜか必勝法があります。`;

  constructor() {
    super("janken");
  }

  game: AtuiJanken | null = null;

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (!content.includes("じゃんけん"))
      return { handleNext: true, changeMode: false };
    this.game = new AtuiJanken();
    atui._emitRes(resBuilder.md("最初はグー、じゃんけん"));
    return { handleNext: false, changeMode: true };
  }

  async funcModeHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    if (!this.game) {
      atui._emitRes(resBuilder.error("ゲームが強制的に終了されました。"));
      return { changeMode: true, handleNext: false };
    }
    const { response, state } = this.game.onAtuiMessage(resBuilder.req.content);
    if (typeof response === "string") {
      const builder = resBuilder.md(response);
      await atui._emitRes(builder);
    }
    switch (state) {
      case AtuiGameFlagType.ERROR:
        atui._emitRes(resBuilder.error("ゲーム中にエラーが発生しました。"));
        return { changeMode: true, handleNext: false };
      case AtuiGameFlagType.CANCELED:
        atui._emitRes(resBuilder.md("ゲームがキャンセルされました。"));
        return { changeMode: true, handleNext: false };
      case AtuiGameFlagType.USER_WIN:
      case AtuiGameFlagType.USER_LOSE:
        return { changeMode: true, handleNext: false };
    }
    return { changeMode: false, handleNext: false };
  }
}
