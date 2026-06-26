import { Atui } from "../../atui";
import { AtuiBaseFunction } from "../../atui/functions";
import { HandlerResult } from "../../atui/functions/AtuiFunction";
import { AtuiResponseBuilder } from "../../atui/ResponseBuilder";

export class AtuiInAtuiFunction extends AtuiBaseFunction {
  description: string = `Web限定。atuiでatuiを起動する。`;
  longDescription: string = `「atuiを起動して」というと起動します。atuiが。なんと無改変のオリジナルatuiが。`;

  constructor() {
    super("atui-in-atui");
  }

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (content.includes("起動") && /atui/i.test(content)) {
      await atui._emitRes(
        resBuilder.custom("web_html", {
          html: `<div style="width:600px;height:480px;overflow-x:hidden;border:none"><div style="width:600px;height:480px;overflow:hidden;"><iframe src="https://atui.pages.dev/" frameborder="0" scrolling="no" width="1000" height="800" style="transform:scale(0.6);transform-origin:0 0;"></iframe></div></div>`,
          authentication: window,
        }),
      );
      return { handleNext: false, changeMode: false };
    }
    return { handleNext: true, changeMode: false };
  }
}
