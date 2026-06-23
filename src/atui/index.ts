import { AtuiBaseFunction } from "./functions/AtuiFunction";
import { generateAllFunction, NormalFunction } from "./functions";
import { AtuiResponseBuilder } from "./ResponseBuilder";
import { AtuiRequest, AtuiResponse, AtuiRunnableGame } from "./types";
import { wait } from "./util";

export class Atui {
  nowFunc: AtuiBaseFunction;
  _listeners: ((res: AtuiResponse) => any)[];
  currentGame: AtuiRunnableGame | null;
  allowAlwayFunction: boolean = true;
  constructor() {
    this._listeners = [];
    this.currentGame = null;
    this.functions = generateAllFunction();

    const normal = this.functions.find((f) => f instanceof NormalFunction);
    if (!normal) throw new Error("NormalFunction didn't generated");
    this.normal = normal;
    this.nowFunc = normal;
    this.sortPriority();
  }

  functions: AtuiBaseFunction[];
  normal: NormalFunction;
  addFunction(func: AtuiBaseFunction) {
    this.functions.push(func);
    this.sortPriority();
  }
  sortPriority() {
    this.functions.sort((a, b) => b.priority - a.priority);
  }

  async run(atui: Atui, resBuilder: AtuiResponseBuilder) {
    const isNormalNow = atui.nowFunc === this.normal;
    for (const func of this.functions) {
      if (!func.enabled) continue;
      const isFuncThis = atui.nowFunc === func;
      if (
        !isFuncThis &&
        (func.runFuncHandlerTiming === "alway" ||
          (isNormalNow && func.runFuncHandlerTiming === "normal"))
      ) {
        const result = await func.funcHandler(atui, resBuilder);
        if (result.changeMode) atui.nowFunc = func;
      } else if (isFuncThis) {
        const result = await func.funcModeHandler(atui, resBuilder);
        if (result.changeMode) atui.nowFunc = this.normal;
      }
    }

    await atui._emitRes(resBuilder.blank().finish(), 100);
  }

  onResponse(...func: ((res: AtuiResponse) => any)[]) {
    this._listeners.push(...func);
  }

  removeLister(...func: ((res: AtuiResponse) => any)[]) {
    this._listeners = this._listeners.filter((l) => !func.includes(l));
  }

  async _emitRes(
    responseable: AtuiResponse | { res: AtuiResponse },
    deferMS: number = 400,
  ) {
    if (deferMS > 0) await wait(deferMS);
    const response = "res" in responseable ? responseable.res : responseable;
    (async () => {
      for (const listener of this._listeners) {
        try {
          listener(response);
        } catch (ex) {
          console.error(ex);
        }
      }
    })();
  }

  _generateAtuiRequest(content: string): AtuiRequest {
    return {
      content,
      id: Math.floor((Math.random() * 2 - 1) * Number.MAX_SAFE_INTEGER),
    };
  }

  async input(content: string): Promise<AtuiRequest> {
    content = content.trim();
    const atuiRequest = this._generateAtuiRequest(content);
    const atuiResponseBuilder = new AtuiResponseBuilder(atuiRequest);
    if (!content) {
      this._emitRes(atuiResponseBuilder.error(`入力が空です。`).finish(), 200);
      return atuiRequest;
    }

    (async () => {
      for (const func of this.functions) {
        if (!func.enabled) continue;

        const nowFuncNormal = this.nowFunc === this.normal;
        if (
          (func.runFuncHandlerTiming === "alway" && this.allowAlwayFunction) ||
          (func.runFuncHandlerTiming === "normal" && nowFuncNormal)
        ) {
          const { changeMode, handleNext } = await func.funcHandler(
            this,
            atuiResponseBuilder,
          );
          if (changeMode) this.nowFunc = func;
          if (!handleNext) {
            break;
          }
        }

        const nowFuncThis = this.nowFunc === func;
        if (nowFuncThis) {
          const { changeMode, handleNext } = await func.funcModeHandler(
            this,
            atuiResponseBuilder,
          );
          if (changeMode) this.nowFunc = this.normal;
          if (!handleNext) {
            break;
          }
        }
      }

      await this._emitRes(atuiResponseBuilder.blank().finish(), 100);
    })();

    return atuiRequest;
  }
}
