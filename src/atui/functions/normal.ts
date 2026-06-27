import { randomSelect } from "../utils";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";
import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";

export class NormalFunction extends AtuiBaseFunction {
  description: string = `Atuiのデフォルトモードです。`;
  longDescription: string = `他の機能を起動できます。「強制停止」を打つと強制的に戻ってこれます。`;

  atuiList = ["アツ", "atsu", "激アツ", "アッツ", "atu", "アッツ島"];
  constructor() {
    super("normal", -2147483648);
  }
  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    await atui._emitRes(resBuilder.md(randomSelect(this.atuiList)));
    return { changeMode: false, handleNext: true };
  }
}
