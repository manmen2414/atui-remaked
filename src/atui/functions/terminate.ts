import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";

export class TerminateFunction extends AtuiBaseFunction {
  description: string = `Atuiのアクティブな機能を中止し、通常モードに戻ります。`;
  longDescription: string = `「強制停止」と言えば起動します。強制停止 以外の文字を含んでいると起動しません。\n起動時に現在の機能を強制的に中止して通常モードに戻ります。`;
  priority: number = 2147483647;
  runFuncHandlerTiming: "normal" | "alway" | "never" = "alway";
  constructor() {
    super("terminate");
  }

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (content === "強制停止") {
      atui.nowFunc = atui.normal;
      atui._emitRes(resBuilder.md(`強制的に通常モードに戻しました。`));
      return { handleNext: false, changeMode: false };
    }
    return { handleNext: true, changeMode: false };
  }
}
