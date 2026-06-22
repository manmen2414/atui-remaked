import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";

export class HelpFunction extends AtuiBaseFunction {
  description: string = `Atuiの説明を表示します。現在非推奨です。`;
  constructor() {
    super("help");
  }

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (content.includes("help") || content.includes("ヘルプ")) {
      await atui._emitRes(resBuilder.md("説明書を取得しています。"), 200);
      const readme = await fetch("README.md")
        .then((r) => r.text())
        .catch((ex) => {
          atui._emitRes(resBuilder.error(`エラーが発生しました。\n${ex}`));
          return "";
        });
      if (!!readme) {
        await atui._emitRes(resBuilder.md(readme));
      }
      return { handleNext: false, changeMode: false };
    }
    return { handleNext: true, changeMode: false };
  }
}
