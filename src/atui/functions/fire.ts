import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { randomSelect } from "../utils";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";

export class FireFunction extends AtuiBaseFunction {
  description: string = `Atuiを消火・着火できるようにします。`;
  longDescription: string = `「消火」すればatuiが消火されます。消火されるとどうなるかはあなたの目でお確かめください。「着火」すれば元に戻ります。`;

  samuiList = ["サム", "samu", "激サム", "サッム", "cold", "サムイ島"];
  constructor() {
    super("fire");
  }

  priority: number = 50;

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (/消火|鎮火/.test(content)) {
      atui._emitRes(resBuilder.md("えっ"));
      return { handleNext: false, changeMode: true };
    }
    return { handleNext: true, changeMode: false };
  }

  async funcModeHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (content.includes("着火")) {
      atui._emitRes(resBuilder.md("アツアツだぜ！"));
      return { changeMode: true, handleNext: false };
    }
    atui._emitRes(resBuilder.md(randomSelect(this.samuiList)));
    return { changeMode: false, handleNext: false };
  }
}
