import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";

export class CalculatorFunction extends AtuiBaseFunction {
  description: string = `極めて普通の電卓です。`;

  constructor() {
    super("calculator");
  }

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (content.includes("電卓")) {
      await atui._emitRes(resBuilder.md("電卓を起動します。"));
      await atui._emitRes(
        resBuilder
          .page("HotCalculator.html")
          .modePopup()
          .popupTitle("Atui電卓")
          .popupFeatures("width=320,height=470"),
      );
      return { handleNext: false, changeMode: false };
    }
    return { handleNext: true, changeMode: false };
  }
}
