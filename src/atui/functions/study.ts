import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";

export class StudyFunction extends AtuiBaseFunction {
  description: string = `勉強を支援する"note-study"ページを開きます。`;
  constructor() {
    super("study");
  }

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (content.includes("勉強")) {
      await atui._emitRes(resBuilder.md("新規タブで開きます。"));
      await atui._emitRes(
        resBuilder.page("https://note-study.studio.site/"),
        0,
      );
      return { handleNext: false, changeMode: false };
    }
    return { handleNext: true, changeMode: false };
  }
}
