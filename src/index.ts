import { Atui } from "./atui";
import * as Marked from "marked";
import "./web/cursor";
import "./web/specials";
import "./atui-remaked.css";
import { webModifyToAtui } from "./web/atuiModify";

const atui = new Atui();
webModifyToAtui(atui);

function printLog(text: string, isUser: boolean = false) {
  const logBox = document.getElementById("message-log");
  if (!logBox) throw new Error("logBox not found");
  const div = document.createElement("div");
  div.className = "log-entry " + (isUser ? "user-msg" : "bot-msg");
  div.textContent = text;
  logBox.appendChild(div);
  logBox.scrollTop = logBox.scrollHeight;
}

function printMarkdown(text: string) {
  const logBox = document.getElementById("message-log");
  if (!logBox) throw new Error("logBox not found");
  const div = document.createElement("div");
  div.className = "log-entry bot-msg";
  div.innerHTML = Marked.parse(text.replace(/\r\n|\r|\n/g, "\n\n"), {
    async: false,
  });
  logBox.appendChild(div);
  logBox.scrollTop = logBox.scrollHeight;
}

function printHTML(html: string) {
  const logBox = document.getElementById("message-log");
  if (!logBox) throw new Error("logBox not found");
  const div = document.createElement("div");
  div.className = "log-entry bot-msg";
  div.innerHTML = `<center><div class="info-card">${html}</div></center>`;
  logBox.appendChild(div);
  logBox.scrollTop = logBox.scrollHeight;
}

document.getElementById("myTextBox")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") getStringValue();
});
document.getElementById("sendText")?.addEventListener("click", () => {
  getStringValue();
});

async function getStringValue() {
  const inputElement = document.getElementById("myTextBox");
  if (!inputElement) throw new Error("myTextBox not found");
  if (!(inputElement instanceof HTMLInputElement))
    throw new Error("myTextBox is replaced to other element");
  const val = inputElement.value.trim();
  if (!val) return;
  printLog(val, true);
  inputElement.value = "";
  await atui.input(val);
}

atui.onResponse((res) => {
  switch (res.type) {
    case "error":
      printLog(res.content + "\n(errored) ");
      break;
    case "md":
      printMarkdown(res.content);
      break;
    case "page":
      let target = "_blank";
      let features = "";
      if (res.target === "popup") {
        features = "popup";
        target = "Atui Popup";
        if (res.popupInfo?.title) target = res.popupInfo.title;
        if (res.popupInfo?.features) features = res.popupInfo.features;
      }
      if (res.target === "replace") target = "_self";
      open(res.url, target, features);
      break;
    case "blank":
      break;
    case "custom":
      if (res.customId === "web_html") {
        if (!Object.hasOwn(res.content, "authentication")) break;
        if (!Object.hasOwn(res.content, "html")) break;
        if (res.content.authentication !== window) break;
        if (typeof res.content.html !== "string") break;
        printHTML(res.content.html);
      }
      break;
  }
});

window.addFunction = (func) => {
  atui.addFunction(func);
};
window.atui = atui;

printLog("今日はどうされましたか？");
