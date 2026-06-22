import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";
import { AtuiGameFlagType } from "../types";
import { PRIORITY_WORDS, WORDS } from "../constants/shiritoriWords";

export class AtuiShiritori {
  static async getAtuiShiritoriParameters() {
    return {
      words: WORDS,
      priorityWords: PRIORITY_WORDS,
    };
  }
  usedWords: Set<string>;
  dictionary: Set<string>;
  wordMap: Map<string, string[]>;
  priorityMap: Map<string, number>;
  oldNoun: string;
  constructor(words: string[], priorityWords: { [word: string]: number } = {}) {
    this.usedWords = new Set();
    this.dictionary = new Set(words);
    this.wordMap = new Map();
    for (const word of words) {
      const key = word[0];
      const wordsArr = this.wordMap.get(key);
      if (!wordsArr) this.wordMap.set(key, [word]);
      else wordsArr.push(word);
    }
    this.priorityMap = new Map();
    for (const [word, weight] of Object.entries(priorityWords)) {
      this.priorityMap.set(word, weight);
    }
    this.oldNoun = "しりとり";
  }

  _getLastChar(word: string) {
    let chars = [...word];
    let last = chars.pop();
    if (last === "ー" && chars.length > 0) last = chars.pop();
    if (last === "っ" && chars.length > 0) last = chars.pop();
    if (!last) return;
    const smallMap: { [small: string]: string } = {
      ゃ: "や",
      ゅ: "ゆ",
      ょ: "よ",
    };
    if (last in smallMap) last = smallMap[last];
    return last;
  }
  _getNormalCandidates(lastChar: string) {
    return this.wordMap.get(lastChar) || [];
  }

  _getPriorityWord(lastChar: string) {
    let total = 0;
    let candidates: [string, number][] = [];
    for (const [word, weight] of this.priorityMap) {
      if (!word.startsWith(lastChar)) continue;
      const adjustedWeight = word.endsWith("ん") ? weight * 0.1 : weight;
      total += adjustedWeight;
      candidates.push([word, adjustedWeight]);
    }
    if (candidates.length === 0) return null;
    let selectRandom = Math.random() * total;
    for (const [word, w] of candidates) {
      selectRandom -= w;
      if (selectRandom <= 0) return word;
    }
    return null;
  }

  returnNextNoun(noun: string): [string, AtuiGameFlagType] {
    const prevLast = this._getLastChar(this.oldNoun);
    if (prevLast !== noun[0])
      return [
        "文字がつながっていません\nあなたの負けです。",
        AtuiGameFlagType.USER_LOSE,
      ];
    const lastChar = this._getLastChar(noun);
    if (this._getLastChar(noun) === "ん")
      return [
        "んで終わっています\nあなたの負けです。",
        AtuiGameFlagType.USER_LOSE,
      ];
    if (!this.dictionary.has(noun) || !lastChar)
      return [
        "辞書にない単語です\nあなたの負けです。",
        AtuiGameFlagType.USER_LOSE,
      ];
    if (this.usedWords.has(noun))
      return [
        "使用済み単語です\nあなたの負けです。",
        AtuiGameFlagType.USER_LOSE,
      ];

    this.usedWords.add(noun);
    let next = null;
    const PRIORITY_RATE = 0.4;

    if (Math.random() < PRIORITY_RATE) next = this._getPriorityWord(lastChar);
    if (!next) {
      const list = this._getNormalCandidates(lastChar);
      if (list.length === 0)
        return [
          "返す語がありません\nあなたの勝ちです。",
          AtuiGameFlagType.USER_WIN,
        ];
      next = list[Math.floor(Math.random() * list.length)];
    }

    this.usedWords.add(next);
    this.priorityMap.delete(next);
    const arr = this.wordMap.get(next[0]);
    if (arr)
      this.wordMap.set(
        next[0],
        arr.filter((w) => w !== next),
      );
    this.oldNoun = next;

    if (this._getLastChar(next) === "ん")
      return [
        `${next}\nCPUが自爆しました\nあなたの勝ちです。`,
        AtuiGameFlagType.USER_WIN,
      ];
    return [next, AtuiGameFlagType.CONTINUE];
  }
  onAtuiMessage(content: string) {
    try {
      const res = this.returnNextNoun(content);
      return {
        response: res[0],
        state: res[1],
      };
    } catch (ex) {
      if (typeof ex === "undefined")
        return {
          response: "不明なエラーが発生しました。",
          state: AtuiGameFlagType.ERROR,
        };
      console.error(ex);
      return {
        response: `エラーが発生しました: ${ex}`,
        state: AtuiGameFlagType.ERROR,
      };
    }
  }
}

export class ShiritoriFunction extends AtuiBaseFunction {
  description: string = `Atuiにしりとり勝負を仕掛けられます。Atuiの語彙は不十分なため、知らないワードがとても多いです。`;
  constructor() {
    super("shiritori");
  }

  game: AtuiShiritori | null = null;

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (!content.includes("しりとり"))
      return { handleNext: true, changeMode: false };
    this.game = new AtuiShiritori(WORDS, PRIORITY_WORDS);
    atui._emitRes(
      resBuilder.md(
        "しりとりゲーム開始！ 最初は「しりとり」から。「り」で始まる言葉を入力してください。\nしりとりが成立しなくなった場合終了します。",
      ),
    );
    return { handleNext: false, changeMode: true };
  }

  async funcModeHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    if (!this.game) {
      atui._emitRes(resBuilder.error("ゲームが強制的に終了されました。"));
      return { changeMode: true, handleNext: false };
    }
    const { response, state } = this.game.onAtuiMessage(resBuilder.req.content);
    if (typeof response === "string") {
      const builder = resBuilder.md(response);
      await atui._emitRes(builder);
    }
    switch (state) {
      case AtuiGameFlagType.ERROR:
        atui._emitRes(resBuilder.error("ゲーム中にエラーが発生しました。"));
        return { changeMode: true, handleNext: false };
      case AtuiGameFlagType.CANCELED:
        atui._emitRes(resBuilder.md("ゲームがキャンセルされました。"));
        return { changeMode: true, handleNext: false };
      case AtuiGameFlagType.USER_WIN:
      case AtuiGameFlagType.USER_LOSE:
        return { changeMode: true, handleNext: false };
    }
    return { changeMode: false, handleNext: false };
  }
}
