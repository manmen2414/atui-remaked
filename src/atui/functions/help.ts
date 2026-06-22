import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";
import readme from "../../../README.md?raw";

export class HelpFunction extends AtuiBaseFunction {
  description: string = `Atuiの説明を表示します。`;
  constructor() {
    super("help");
  }

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (content.includes("help") || content.includes("ヘルプ")) {
      if (!!readme) {
        await atui._emitRes(resBuilder.md(readme));
      } else {
        await atui._emitRes(resBuilder.md("説明書データがありません。"));
      }
      return { handleNext: false, changeMode: false };
    }
    return { handleNext: true, changeMode: false };
  }
}
