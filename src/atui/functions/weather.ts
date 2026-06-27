import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { entries, escapeMarkdown } from "../utils";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";
import { WeatherIds } from "../constants/weather";

export class WeatherFunction extends AtuiBaseFunction {
  description: string = `特定の地域の天気を取得します。`;
  longDescription: string = `「天気」と言えば起動します。\n都道府県名や対応している地域の名前もしくはコードを入力することでその地域の天気を取得できます。\n利用可能な地域を取得するには「リスト」と聞いてください。\nすでに過ぎ去った時間など無効な情報は表示されません。\n「東京の天気」など、地域を直接指定して表示することもできます。`;

  constructor() {
    super("weather");
  }

  async funcHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (!content.includes("天気"))
      return { handleNext: true, changeMode: false };
    const directCheck = getWeather(content);
    if (directCheck) {
      const weather = await directCheck.promise;
      if (weather) {
        await atui._emitRes(resBuilder.md(weather));
        return { handleNext: false, changeMode: false };
      }
    }
    atui._emitRes(
      resBuilder.md(
        '地域名を入力してください。地域リストを表示するには"リスト"と入力してください。',
      ),
    );
    return { handleNext: false, changeMode: true };
  }

  async funcModeHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (/キャンセル|終了|中断|停止|戻る|cancel|stop|end|back/.test(content)) {
      await atui._emitRes(resBuilder.md("キャンセルしました。"));
      return { handleNext: false, changeMode: true };
    }
    if (content.includes("リスト")) {
      let md = `https://weather.tsukumijima.net/primary_area.xml より\n`;

      for (const [pref, city] of entries(WeatherIds)) {
        md += `${pref}: `;
        for (const cityName in city) {
          if (!Object.hasOwn(WeatherIds, pref)) continue;
          md += `${cityName} `;
        }
        md += `\n`;
      }
      await atui._emitRes(resBuilder.md(md));
      return { handleNext: false, changeMode: false };
    } else {
      try {
        const result = getWeather(content);
        if (!result) {
          await atui._emitRes(
            resBuilder.md(
              "対象地域が見つかりませんでした。もう一度お試しください。",
            ),
          );
          return { handleNext: false, changeMode: false };
        }
        await atui._emitRes(
          resBuilder.md(
            `${escapeMarkdown(result.found)}の天気を調べています...`,
          ),
        );
        const weather = await result.promise;
        if (!weather) throw undefined;
        await atui._emitRes(resBuilder.md(weather));
      } catch (ex) {
        await atui._emitRes(
          resBuilder.error(
            "データの取得に失敗しました。\n通常モードに戻ります。",
          ),
        );
      }

      return { handleNext: false, changeMode: true };
    }
  }
}

function getWeather(
  region: string,
): { found: string; promise: Promise<string | null> } | null {
  let cityName = "";
  let cityId = "";
  const cityNameId: [string, string][] = [];
  const prefNameId: [string, string][] = [];
  for (const cities of Object.values(WeatherIds)) {
    for (const city of entries(cities)) {
      cityNameId.push([city[0], city[1]]);
    }
  }

  for (const [pref, cities] of entries(WeatherIds)) {
    const primaryCity = Object.entries(cities).find(([_, v]) =>
      v.endsWith("10"),
    );
    if (!primaryCity) continue;
    prefNameId.push([pref, primaryCity[1]]);
  }
  //都道府県を含まないテキストをまず市として認識する
  [cityName, cityId] = cityNameId.find(
    ([name, id]) =>
      new RegExp(`${name}[^都道府県]?`).test(region) || region.includes(id),
  ) ?? ["", ""];
  if (!cityName)
    // 都道府県を捜索する、この際都道府県は省略できる
    [cityName, cityId] = prefNameId.find(([name]) =>
      region.includes(name.slice(0, -1)),
    ) ?? ["", ""];
  if (!cityName) {
    return null;
  }

  const promise = fetch(
    `https://weather.tsukumijima.net/api/forecast/city/${cityId}`,
  )
    .then((res) => res.json())
    .then((data) => {
      const date = data.forecasts[0];
      const temp = date.temperature;
      const rain = date.chanceOfRain;
      let temp_max = temp.max.celsius ?? "--";
      let temp_min = temp.min.celsius ?? "--";

      const md = `# ${data.location.city}の${date.dateLabel}の天気
${data.location.city}の${date.dateLabel}の天気は**${date.telop}**です。
- 最高気温: ${temp_max}℃
- 最低気温: ${temp_min}℃
## 降水確率
- 00:00~06:00：${rain.T00_06}
- 06:00~12:00：${rain.T06_12}
- 12:00~18:00：${rain.T12_18}
- 18:00~24:00：${rain.T18_24}

データ提供：${data.copyright.title}
より詳細な天気予報はこちら (市町村単位): https://weather.tsukumijima.net/primary_area.xml
`;

      return md;
    })
    .catch(() => null);

  return {
    found: cityName,
    promise,
  };
}
