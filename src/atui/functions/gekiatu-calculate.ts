import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";
import { escapeMarkdown, joinRegExp } from "../utils";
import { BigNumber } from "../utils/BigNumber";
import { ExpressionEvaler } from "../utils/eval-expression";
import { toStrRegExp } from "../utils/index";

const getLastExpressionExp = /(最後|さっき)の(式|計算)/;
const lastValueExp = /^(?:答え|数|値|数値)/;
const editValueExpressionExp = joinRegExp(
  RegExp(toStrRegExp(lastValueExp) + "?"),
  /(?:に|から|を)?(-?[0-9\.]+)/,
);
const addExp = joinRegExp(
  editValueExpressionExp,
  /(?:を)?(?:足して|たして|追加|追加して)$/,
);
const subtrackExp = joinRegExp(
  editValueExpressionExp,
  /(?:を)?(?:引いて|ひいて|除いて)$/,
);
const multipyExp = joinRegExp(
  editValueExpressionExp,
  /(?:で|を)?(?:かけて|掛けて|倍|倍して)$/,
);
const devideExp = joinRegExp(
  editValueExpressionExp,
  /(?:で|を)?(?:わって|割って|分けて)/,
);
const revertExp =
  /^(?:計算)?履歴を(\d+)(?:回|つ|個)(?:戻して|もどして|消して)$/;
type InstantCalculateType = "+" | "-" | "*" | "/";
const instantCalculateExpList = new Map<InstantCalculateType, RegExp>();
instantCalculateExpList.set("+", addExp);
instantCalculateExpList.set("-", subtrackExp);
instantCalculateExpList.set("*", multipyExp);
instantCalculateExpList.set("/", devideExp);

export class GekiatuCalculateFunction extends AtuiBaseFunction {
  description: string = `3+5とか9^5とか言うだけで計算してくれます。`;
  longDescription: string = `基本的な四則演算、べき乗(右辺が0か自然数に限る)、かっこ演算に対応しています。
\`(2+3)(-1+6)\`のように暗黙的な乗算に対応しています。
数値だけ言った場合はその数値を記憶して下の演算に利用します。
計算結果に対して「2足して」「4を引いて」「8倍して」「16で割って」などの指示が出せます。
「計算履歴」で計算した履歴を取得できます。
「履歴を2回戻して」など言うと計算履歴を一定個数削除することができます。
`;

  history: BigNumber[] = [];
  lastExpression: string = "";
  lastExpressionAnswer: BigNumber | null = null;

  constructor() {
    super("gekiatu-calculate");
  }

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    let content = resBuilder.req.content;

    // 全角を半角に変換
    content = content
      .replace(/[０-９]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
      })
      .replace(/ー/g, "-")
      .replace(/。|．/g, ".");

    if (/^-?[0-9\.]+$/.test(content)) {
      await atui._emitRes(
        resBuilder.md(`${escapeMarkdown(content)} を記憶しました。`),
      );
      this.history.push(new BigNumber(content));
      return { handleNext: false, changeMode: false };
    }

    if (getLastExpressionExp.test(content)) {
      await atui._emitRes(
        resBuilder.md(
          this.lastExpression
            ? `最後の計算は${escapeMarkdown(this.lastExpression)}で、**${this.lastExpressionAnswer}**です。`
            : `まだ計算していません。`,
        ),
      );
      return { changeMode: false, handleNext: false };
    }
    if (revertExp.test(content)) {
      const [_, requestCount] = revertExp.exec(content) ?? [];
      const revertCount = Math.min(
        Math.abs(parseInt(requestCount)),
        this.history.length,
      );
      this.history = this.history.slice(0, -revertCount);
      const now = this.history[this.history.length - 1] ?? "なし";
      await atui._emitRes(
        resBuilder.md(
          `履歴から${revertCount}つを削除しました。\n現在値: **${now}**`,
        ),
      );
      return { changeMode: false, handleNext: false };
    }
    if (/計算履歴/.test(content)) {
      await atui._emitRes(
        resBuilder.md(
          this.history.length === 0
            ? `ありません。`
            : `${this.history.join(" -> ")}`,
        ),
      );

      return { changeMode: false, handleNext: false };
    }

    return (
      (await this.instant(atui, resBuilder, content)) ??
      (await this.calculate(atui, resBuilder, content)) ?? {
        changeMode: false,
        handleNext: true,
      }
    );
  }
  async instant(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
    content: string,
  ): Promise<HandlerResult | undefined> {
    const lastHistory = this.history[this.history.length - 1];
    let calcType: InstantCalculateType = "+";
    let calcNum: string = "";
    for (const [type, reg] of instantCalculateExpList.entries()) {
      const [_, numStr] = content.match(reg) ?? [];
      if (!numStr) continue;
      calcNum = numStr;
      calcType = type;
      break;
    }
    if (!calcNum) return;
    if (!lastHistory) {
      await atui._emitRes(
        resBuilder.md(
          "最後の数値がありません。数値または計算式を送ってください。",
        ),
      );
    }

    let messageCalculatedPart = ``;
    switch (calcType) {
      case "+":
        this.history.push(lastHistory.added(calcNum));
        messageCalculatedPart = `に${calcNum}を足し`;
        break;
      case "-":
        this.history.push(lastHistory.subtracted(calcNum));
        messageCalculatedPart = `から${calcNum}を引き`;
        break;
      case "*":
        this.history.push(lastHistory.multipied(calcNum));
        messageCalculatedPart = `に${calcNum}を掛け`;
        break;
      case "/":
        try {
          this.history.push(lastHistory.devided(calcNum));
          messageCalculatedPart = `を${calcNum}で割り`;
        } catch (ex) {
          await atui._emitRes(
            resBuilder.md("0除算させようとしないでください。"),
          );
          return { changeMode: false, handleNext: false };
        }
        break;
    }

    const now = this.history[this.history.length - 1];
    await atui._emitRes(
      resBuilder.md(
        `${lastHistory}${messageCalculatedPart}ました。\n現在値: **${now}**`,
      ),
    );
    return { changeMode: false, handleNext: false };
  }

  async calculate(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
    content: string,
  ): Promise<HandlerResult | undefined> {
    try {
      const evaler = new ExpressionEvaler(content);
      const calculated = evaler.eval();
      this.lastExpression = evaler.expression;
      this.lastExpressionAnswer = calculated;
      this.history.push(calculated);
      await atui._emitRes(
        resBuilder.md(`${escapeMarkdown(content)} は **${calculated}** です。`),
      );
      return { handleNext: false, changeMode: false };
    } catch (ex) {
      if (!(ex instanceof Error)) {
        console.error(ex);
        return { handleNext: false, changeMode: false };
      }
      if (ex.message === "BigInt division by zero") {
        await atui._emitRes(resBuilder.md(`0除算ってよくないと思うんですよ`));
      } else if (
        ex.message.startsWith("BigNumber doesn't support number to the")
      ) {
        await atui._emitRes(
          resBuilder.md(
            `べき乗って0か自然数にしか対応してないって言ったと思うんですが`,
          ),
        );
      } else {
        return { handleNext: true, changeMode: false };
      }
    }
    return;
  }
}
