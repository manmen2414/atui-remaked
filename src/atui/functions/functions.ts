import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";

export class FunctionsFunction extends AtuiBaseFunction {
  description: string = `Atuiが現在使える機能を表示します。\n`;
  constructor() {
    super("functions");
  }

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (content.includes("機能") || /^(\?|？)$/.test(content)) {
      let str = `現在は"${atui.nowFunc.id}"モードが有効化されています。\n`;
      for (const func of atui.functions) {
        str += `## ${func.id} ${func.enabled ? "" : "(無効)"}\n`;
        str += `${func.description}\n`;
      }
      atui._emitRes(resBuilder.md(str));
      return { handleNext: false, changeMode: false };
    }
    return { handleNext: true, changeMode: false };
  }
}
