import { CustomNavigator } from "./types";

const cNavigator = navigator as CustomNavigator;

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");

  const clock = document.getElementById("clock");
  if (!clock) throw new Error("clock not found");
  clock.textContent = `${h}:${m}:${s}`;
}
// 1秒ごとに更新
setInterval(updateClock, 1000);

// 初回実行
updateClock();

async function updateBattery() {
  const batteryElem = document.getElementById("battery");
  if (!batteryElem) throw new Error("#battery not found");
  function batteryFailed() {
    if (!batteryElem) throw new Error("#battery not found");
    batteryElem.textContent = "";
  }
  if (!cNavigator.getBattery) {
    return batteryFailed();
  }

  const battery = await cNavigator.getBattery();
  const level = Math.round(battery.level * 100);

  if (isNaN(level)) {
    batteryFailed();
  }

  if (battery.charging) {
    batteryElem.innerHTML = `<font color = "#ffff00"> ⚡︎ ${level}% </font>`;
    return;
  }
  if (level <= 20) {
    batteryElem.innerHTML = `<font color = "#ff0000"> ${level}% </font>`;
    return;
  } else if (level <= 70) {
    batteryElem.innerHTML = `<font color = "#ffa500"> ${level}% </font>`;
    return;
  } else {
    batteryElem.innerHTML = `<font color = "#00ff00"> ${level}% </font>`;
    return;
  }
}

setInterval(updateBattery, 1000);
updateBattery();

function setLabelWithTime() {
  const openPageDate = new Date();
  const openPageHour = openPageDate.getHours();
  let label = "";
  if (openPageHour >= 3 && openPageHour < 10) label = "Good Morning!";
  else if (openPageHour >= 10 && openPageHour < 16) label = "Hello!";
  else if (openPageHour >= 16 && openPageHour < 20) label = "Good Evening!";
  else label = "Good Night!";
  const labelElem = document.getElementById("div1");
  if (!labelElem) throw new Error("label element not found");
  labelElem.innerHTML = `<b> ${label} </b>`;
}
setLabelWithTime();
