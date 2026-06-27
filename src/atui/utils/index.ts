export const wait = (ms: number): Promise<void> =>
  new Promise((s) => setTimeout(() => s(), ms));

export const randomSelect = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export function htmlEncode(str: string) {
  const elem = document.createElement("div");
  elem.textContent = str; // 文字列をセットして自動エスケープ
  return elem.innerHTML; // エンコードされたHTMLを取得
}

export function escapeMarkdown(text: string) {
  // Markdownの特殊文字（*.[]\(\)_~`>#+-!）をすべてバックスラッシュでエスケープ
  return text.replace(/[*.\[\]()_~`>#+\-!]/g, "\\$&");
}

// オブジェクトをループする際に型チェックしてくれる
export const entries = <T extends object = object>(
  obj: T,
): [keyof T, T[keyof T]][] => {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
};

// regExpを文字列化
export function toStrRegExp(reg: RegExp) {
  return reg.toString().slice(1, -1);
}
// toStrRegExpするが非マークグループ化する
export function toStrRegExpGrouped(reg: RegExp) {
  return "(?:" + reg.toString().slice(1, -1) + ")";
}
// 引数のRegExpを満たす任意のRegExpを生成する
export function orJoinRegExp(...reg: RegExp[]) {
  return new RegExp(reg.map(toStrRegExpGrouped).join("|"));
}
// ただjoinする
export function joinRegExp(...reg: RegExp[]) {
  return new RegExp(reg.map(toStrRegExpGrouped).join(""));
}
