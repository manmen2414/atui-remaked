import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";

export class PostFunction extends AtuiBaseFunction {
  description: string = `郵便番号と住所を相互変換します。`;
  longDescription: string = `APIを用いています。「郵便番号」と打てば起動し、住所または郵便番号を入力することで変換を行います。`;

  constructor() {
    super("post");
  }

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (!content.includes("郵便"))
      return { handleNext: true, changeMode: false };
    atui._emitRes(resBuilder.md("郵便番号または住所を入力してください。"));
    return { handleNext: false, changeMode: true };
  }

  async funcModeHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    const zipCodeReg = /([0-9]{7})|([0-9]{3})-([0-9]{4})/.exec(content);
    if (zipCodeReg) {
      atui._emitRes(resBuilder.md("郵便番号から住所に変換します。"));
      // 郵便番号APIを叩く（valをそのまま渡す）
      const zipCode = !zipCodeReg[2]
        ? zipCodeReg[1]
        : zipCodeReg[2] + zipCodeReg[3];
      await fetch(
        `https://jp-postal-code-api.ttskch.com/api/v1/${zipCode}.json`,
      )
        .then((res) => {
          if (!res.ok) throw new Error("zipcode fetch failed");
          return res.json();
        })
        .then((data) => {
          // 例：dataの中から住所を組み立てて表示
          const addr = data.addresses[0];
          atui._emitRes(
            resBuilder.md(
              `住所：${addr.ja.prefecture}${addr.ja.address1}${addr.ja.address2}`,
            ),
          );
        })
        .catch(() =>
          atui._emitRes(
            resBuilder.md("入力エラー。正しい住所を入力してください。"),
          ),
        );
    } else {
      atui._emitRes(resBuilder.md("住所から郵便番号に変換します。"));
      await fetch(
        `https://corsproxy.io/?https://api.excelapi.org/post/zipcode?address=${content}`,
      )
        .then((res) => {
          if (!res.ok) throw new Error("address fetch failed");
          return res.text();
        })
        .then((data) => {
          atui._emitRes(
            resBuilder.md(!data ? `郵便番号検索エラー` : `郵便番号：${data}`),
          );
        })
        .catch(() =>
          atui._emitRes(
            resBuilder.md("入力エラー。正しい郵便番号を入力してください。"),
          ),
        );
    }
    return { changeMode: true, handleNext: false };
  }
}
