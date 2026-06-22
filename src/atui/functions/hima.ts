import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";

export class HimaFunction extends AtuiBaseFunction {
  description: string = `暇つぶし動画を再生します。`;
  constructor() {
    super("hima");
  }

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (content.includes("暇") || content.includes("ひま")) {
      await atui._emitRes(resBuilder.md("暇つぶし動画を再生します。"));
      await atui._emitRes(
        resBuilder.page("https://rickroll.it/rickroll.mp4"),
        3000,
      );
      await atui._emitRes(resBuilder.md("𝒀𝑶𝑼 𝑮𝑶𝑻 𝑹𝑰𝑪𝑲𝑹𝑶𝑳𝑳𝑬𝑫"), 100);
      return { handleNext: false, changeMode: false };
    }
    return { handleNext: true, changeMode: false };
  }
}
