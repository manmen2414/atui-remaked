import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { escapeMarkdown } from "../util";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";

export class QRFunction extends AtuiBaseFunction {
  description: string = `QRコードを生成します。`;
  longDescription: string = `「QR」と打てば起動します。入力した文字列をQRコードに変換します。`;

  constructor() {
    super("qr");
  }

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (!content.includes("QR") && !content.includes("qr"))
      return { handleNext: true, changeMode: false };
    atui._emitRes(resBuilder.md("URLまたはテキストを入力してください。"));
    return { handleNext: false, changeMode: true };
  }

  async funcModeHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(content)}`;
    const md = `## \`${escapeMarkdown(content)}\`\n![${escapeMarkdown(content)}のQRコード](${url})`;
    atui._emitRes(resBuilder.md(md));
    return { changeMode: true, handleNext: false };
  }
}
