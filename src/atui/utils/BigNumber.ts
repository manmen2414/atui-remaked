export type BigNumberSolveable = BigNumber | bigint | number | string;

export class BigNumber {
  int: bigint;
  pow10: number;
  constructor(num: BigNumberSolveable = 0) {
    // 値確認
    if (num instanceof BigNumber) {
      this.int = num.int;
      this.pow10 = num.pow10;
    } else if (typeof num === "bigint") {
      this.int = num;
      this.pow10 = 0;
    } else {
      if (typeof num === "number") num = `${num}`;
      if (!/^-?(\d*)(\.\d*)?$/.test(num))
        throw new TypeError(`${num} is not vaild number`);
      // ".4"などの値に対応
      if (num.startsWith("-")) num = `-0${num.slice(1)}`;
      else num = `0${num}`;
      // コンマ0除外
      num = num.replace(/(?<=\.(\d)*)0+$/, "");
      const [intAreaStr, decimalAreaStl] = num.split(".");

      this.int = BigInt(`${intAreaStr}${decimalAreaStl ?? ""}`);
      this.pow10 = (decimalAreaStl ?? "").length;
    }
  }
  toNumber() {
    return Number(this.int) / 10 ** this.pow10;
  }
  toString() {
    let str = this.int.toString();
    if (this.pow10 === 0) return str;
    const isMinus = str.startsWith("-");
    const abs = isMinus ? str.slice(1) : str;
    let intStr = abs.slice(0, -this.pow10) || "0";
    let decimalStr = abs.slice(-this.pow10).padStart(this.pow10, "0");
    return `${isMinus ? "-" : ""}${intStr}.${decimalStr}`;
  }
  clone() {
    return new BigNumber(this);
  }
  setPow10(targetPow10: number) {
    if (targetPow10 < 0) targetPow10 = 0;
    const diff = Math.abs(this.pow10 - targetPow10);
    const diffPow10 = 10n ** BigInt(diff);
    if (this.pow10 > targetPow10) {
      this.int = this.int / diffPow10;
      this.pow10 = targetPow10;
    } else {
      this.int = this.int * diffPow10;
      this.pow10 = targetPow10;
    }
    return this;
  }
  tweakPow10() {
    let isOtherNumbered = false;
    const newPower =
      this.pow10 -
      this.int
        .toString()
        .split("")
        .reverse()
        .filter((v) => {
          if (v === "0" && !isOtherNumbered) return true;
          isOtherNumbered = true;
          return false;
        }).length;

    return this.setPow10(newPower);
  }

  add(target: BigNumberSolveable) {
    const t = new BigNumber(target);
    const pow10Max = Math.max(t.pow10, this.pow10);
    t.setPow10(pow10Max);
    this.setPow10(pow10Max);
    this.int += t.int;
    this.tweakPow10();
    return this;
  }

  added(...args: Parameters<BigNumber["add"]>) {
    return this.clone().add(...args);
  }

  subtract(target: BigNumberSolveable) {
    const t = new BigNumber(target);
    return this.add(t.filpSign());
  }

  subtracted(...args: Parameters<BigNumber["subtract"]>) {
    return this.clone().subtract(...args);
  }

  multipy(target: BigNumberSolveable) {
    const t = new BigNumber(target);
    this.int *= t.int;
    this.pow10 += t.pow10;
    this.tweakPow10();
    return this;
  }

  multipied(...args: Parameters<BigNumber["multipy"]>) {
    return this.clone().multipy(...args);
  }

  devide(target: BigNumberSolveable, decimalLimit = Math.max(this.pow10, 30)) {
    const t = new BigNumber(target);
    this.setPow10(decimalLimit);
    this.int *= BigInt(10 ** t.pow10);
    this.int /= t.int;
    this.tweakPow10();
    return this;
  }

  devided(...args: Parameters<BigNumber["devide"]>) {
    return this.clone().devide(...args);
  }

  filpSign() {
    this.int *= -1n;
    return this;
  }

  pow(target: BigNumberSolveable) {
    const t = new BigNumber(target);
    t.tweakPow10();
    if (t.pow10 !== 0) {
      throw new Error(
        "BigNumber doesn't support number to the decimal number powered.",
      );
    }
    if (t.int < 0n) {
      throw new Error(
        "BigNumber doesn't support number to the negative number powered.",
      );
    }
    this.int **= t.int;
    this.pow10 *= Number(t.int);
    this.tweakPow10();
    return this;
  }

  powed(...args: Parameters<BigNumber["pow"]>) {
    return this.clone().pow(...args);
  }
}
