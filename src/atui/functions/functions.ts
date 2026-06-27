import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { escapeMarkdown } from "../utils";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";
import { HelpFunction } from "./help";

const TEACH_ABOUT_REGEXP =
  /(.+)(?:について|の機能|とは|(?:って|とは)(?:何|なに|何や|なんや|何ですか|なんですか|何やねん|なんやねん|何なん|なんなん|何だよ|なんだよ))(?:\?|？)?$/;

export class FunctionsFunction extends AtuiBaseFunction {
  description: string = `Atuiが現在使える機能を表示します。\n「～について教えて」や「～の機能」と言えば詳細な説明を出してくれます。`;
  longDescription: string = `この説明を見れているということは、この説明で何かを語る必要がないということです。`;
  priority: number = 10;
  constructor() {
    super("functions");
  }

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    const teachAboutRegexpResult = TEACH_ABOUT_REGEXP.exec(content);
    if (teachAboutRegexpResult) {
      const targetId = teachAboutRegexpResult[1];
      const targetFunc = atui.functions.find((f) => targetId === f.id);

      //atuiってなんだよ
      if (/^atui$/i.test(targetId)) {
        const help = atui.functions.find((v) => v instanceof HelpFunction);
        if (help) {
          return help.funcHandler(
            atui,
            new AtuiResponseBuilder({ content: "help", id: resBuilder.req.id }),
          );
        }
      }

      if (!targetFunc) {
        await atui._emitRes(
          resBuilder.md(
            `ヒント: 「${escapeMarkdown(targetId)}」という機能は存在しません。\n機能一覧を見るには「機能」と言ってください。`,
          ),
          100,
        );
        return { handleNext: true, changeMode: false };
      }
      await atui._emitRes(
        resBuilder.md(`# 機能: ${targetFunc.id}

## 説明
${targetFunc.description}

## 詳細
${targetFunc.longDescription}

## 情報
優先度: ${targetFunc.priority} (高いほどメッセージ処理の早い段階で実行されます)
実行タイミング: ${{ alway: "全メッセージに対して実行", normal: "通常モードまたは該当機能実行中", never: "実行しない" }[targetFunc.runFuncHandlerTiming]}
`),
      );
      return { handleNext: false, changeMode: false };
    } else if (content.includes("機能") || /^(\?|？)$/.test(content)) {
      let str = `現在は"${atui.nowFunc.id}"モードが有効化されています。\n`;
      for (const func of atui.functions) {
        str += `## ${func.id} ${func.enabled ? "" : "(無効)"}\n`;
        str += `${func.description}\n`;
      }
      await atui._emitRes(resBuilder.md(str));
      return { handleNext: false, changeMode: false };
    }
    return { handleNext: true, changeMode: false };
  }
}
