import { orJoinRegExp } from ".";
import { BigNumber } from "./BigNumber";

const numberExp = /[0-9０-９\.]/;
const plusExp = /\+|＋|足す|たす|足/;
const minusExp = /-|ー|(?:(?<!\d)引く|ひく|引)/;
const multiExp = /\*|＊|掛け|かけ|掛|×|×/;
const dividExp = /\/|／|割る|わる|割|÷/;
const powerExp = /\^|＾/;
const parenthesesExp = /\(|\)/;
const operationsExp = orJoinRegExp(
  plusExp,
  minusExp,
  multiExp,
  dividExp,
  powerExp,
  parenthesesExp,
);

export class ExpressionEvaler {
  expression: string;
  calcExpression: string;
  tokens: (string | BigNumber)[] = [];

  findingValue: string[] = [];
  state:
    | "removeParentheses"
    | "calcPower"
    | "calcMultiDivide"
    | "calcPlusMinus" = "removeParentheses";

  constructor(expression: string) {
    this.expression = expression.replace(/\s/g, "");
    this.calcExpression = this.expression.replace(/%/g, "/100");
  }
  eval() {
    this.removeParentheses();
    this.splitWithToken();
    this.fixTokenSpelling();
    this.calcPow();
    this.solveAllNegativeSign();
    this.restoreOmittedTokens();
    this.calcFourOperation("*/");
    this.calcFourOperation("+-");

    const result = this.tokens.find((v) => v instanceof BigNumber);
    if (!result) {
      throw new Error("calculating failed");
    }
    return result;
  }
  removeParentheses() {
    let parentheseLevel = 0;
    let newExpression = "";
    let parentheseStr = "";
    for (const char of this.calcExpression) {
      if (parentheseLevel > 0) parentheseStr += char;

      if (/\(/.test(char)) {
        parentheseLevel++;
      } else if (/\)/.test(char) && parentheseLevel !== 0) {
        parentheseLevel--;
        if (parentheseLevel === 0) {
          const evaler = new ExpressionEvaler(parentheseStr.slice(0, -1));
          newExpression += `(${evaler.eval()}`;
          parentheseStr = "";
        }
      }

      if (parentheseLevel === 0) newExpression += char;
    }
    this.calcExpression = newExpression.replace(/__/g, "_");
  }
  splitWithToken() {
    this.calcExpression = this.calcExpression.replace(/\*\*/g, "^");

    let isPreviousNumber: boolean | null = null;
    let nowToken = "";
    for (const char of this.calcExpression) {
      const isNumber = numberExp.test(char);
      if (isPreviousNumber !== null) {
        if (!isNumber) {
          if (isPreviousNumber) {
            this.tokens.push(new BigNumber(nowToken));
            nowToken = "";
          }
        }
        const checkIsCompleteToken = operationsExp.test(nowToken);
        if (checkIsCompleteToken) {
          this.tokens.push(nowToken);
          nowToken = "";
        }
      }
      isPreviousNumber = isNumber;
      nowToken += char;
    }

    if (nowToken) {
      if (numberExp.test(nowToken)) this.tokens.push(new BigNumber(nowToken));
      else this.tokens.push(nowToken);
    }
  }

  fixTokenSpelling() {
    this.tokens = this.tokens.map((t) => {
      if (t instanceof BigNumber) return t;

      if (plusExp.test(t)) return "+";
      if (minusExp.test(t)) return "-";
      if (multiExp.test(t)) return "*";
      if (dividExp.test(t)) return "/";
      if (powerExp.test(t)) return "^";
      if (parenthesesExp.test(t)) return t;

      throw new Error(`${t} is not vaild token`);
    });
  }

  solveAllNegativeSign() {
    for (
      let i = this.tokens.indexOf("-");
      i !== -1;
      i = this.tokens.indexOf("-")
    ) {
      let willFlipNumber = false;
      for (; i < this.tokens.length; i++) {
        const token = this.tokens[i];
        if (token === "-") {
          this.tokens[i] = "";
          willFlipNumber = !willFlipNumber;
          if (this.tokens[i - 1] === ")") this.tokens[i - 1] = "";
          continue;
        }
        if (token === "(") {
          this.tokens[i] = "";
          continue;
        }
        if (token instanceof BigNumber) {
          if (willFlipNumber) token.filpSign();
          this.tokens = this.tokens.filter((v) => v !== "");
          break;
        }
        throw new Error(`Not correct formula: [${i}](${token})`);
      }
    }
  }

  restoreOmittedTokens() {
    let lastType: "num" | "op" | null = null;

    const newTokens: (string | BigNumber)[] = [];
    for (const token of this.tokens) {
      const nowType = typeof token === "string" ? "op" : "num";
      if (!lastType) {
        newTokens.push(token);
        lastType = nowType;
        continue;
      }
      if (token instanceof BigNumber) {
        if (lastType === "num") {
          newTokens.push("+");
        }
        newTokens.push(token);
      } else if (parenthesesExp.test(token)) {
        newTokens.push("*");
      } else {
        newTokens.push(token);
      }
      lastType = nowType;
    }

    this.tokens = newTokens.filter((v, i, a) => {
      if (typeof v === "string") {
        if (i === 0) return false;
        if (i === a.length - 1) return false;
      }
      if (v === "*") {
        // 演算子が連続した場合は*じゃないほうを優先
        if (typeof a[i - 1] === "string") return false;
        // これの先に*じゃないのがあるのであればこっちを消す
        if (typeof a[i + 1] === "string" && a[i + 1] !== "*") return false;
      }
      return true;
    });
  }

  calcPow() {
    while (true) {
      const powIndex = this.tokens.findLastIndex((s) => s === "^");
      if (powIndex === -1) break;
      this.tokens[powIndex] = "";

      let baseNum: BigNumber | null = null;
      let withNum: BigNumber | null = null;

      // 逆方向探知: 数値のみ(-無視)
      for (const token of this.tokens.slice(0, powIndex).reverse()) {
        if (token instanceof BigNumber) {
          baseNum = token;
          break;
        }
        if (parenthesesExp.test(token)) continue;
        throw new Error(`Not correct formula: [${powIndex}](a^b)`);
      }

      // 順方向探知
      let willFlipNumber = false;
      for (let i = powIndex + 1; i < this.tokens.length; i++) {
        const token = this.tokens[i];
        this.tokens[i] = "";
        if (token instanceof BigNumber) {
          if (willFlipNumber) withNum = token.filpSign();
          else withNum = token;
          break;
        }
        if (token === "-") {
          willFlipNumber = !willFlipNumber;
          continue;
        }
        if (parenthesesExp.test(token)) continue;

        throw new Error(`Not correct formula: [${powIndex}](a^b)`);
      }

      if (!baseNum || !withNum) return;

      baseNum.pow(withNum);

      this.tokens = this.tokens.filter((v) => v !== "");
    }
  }

  calcFourOperation(operators: "+-" | "*/") {
    while (true) {
      const op = this.tokens.findIndex(
        (v) => typeof v === "string" && operators.includes(v),
      );
      if (op === -1) break;

      const left = this.tokens[op - 1];
      const right = this.tokens[op + 1];
      const operator = this.tokens[op];
      // debugger;
      if (typeof left === "string" || typeof right === "string") {
        throw new Error(
          `Not correct formula: [${op}](${left}${operator}${right})`,
        );
      }
      if (operator === "+") left.add(right);
      else if (operator === "-") left.subtract(right);
      else if (operator === "*") left.multipy(right);
      else if (operator === "/") left.devide(right);
      else
        throw new Error(
          `Not correct formula: [${op}](${left}${operator}${right})`,
        );
      this.tokens[op] = "";
      this.tokens[op + 1] = "";
      this.tokens = this.tokens.filter((v) => v !== "");
    }
  }
}
