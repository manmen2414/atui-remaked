import { Atui } from "..";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { entries, escapeMarkdown } from "../util";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";
import { WeatherIds } from "../constants/weather";

export class WeatherFunction extends AtuiBaseFunction {
  description: string = `特定の地域の天気を取得します。`;
  longDescription: string = `「天気」と言えば起動します。\n都道府県名や対応している地域の名前もしくはコードを入力することでその地域の天気を取得できます。\n利用可能な地域を取得するには「リスト」と聞いてください。\nすでに過ぎ去った時間など無効な情報は表示されません。`;

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
          new RegExp(`${name}[^都道府県]?`).test(content) ||
          content.includes(id),
      ) ?? ["", ""];
      if (!cityName)
        // 都道府県を捜索する、この際都道府県は省略できる
        [cityName, cityId] = prefNameId.find(([name]) =>
          content.includes(name.slice(0, -1)),
        ) ?? ["", ""];
      if (!cityName) {
        atui._emitRes(resBuilder.md("対象地域が見つかりませんでした。"));
        return { handleNext: false, changeMode: false };
      }
      const result = Promise.all([
        atui._emitRes(
          resBuilder.md(`${escapeMarkdown(cityName)}の天気を調べています...`),
        ),
        fetch(`https://weather.tsukumijima.net/api/forecast/city/${cityId}`),
      ]);

      await result
        .then(([_, res]) => res.json())
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

          atui._emitRes(resBuilder.md(md));
        })
        .catch(() =>
          atui._emitRes(
            resBuilder.error(
              "データの取得に失敗しました。正しいコードを入力したことを確認して、もう一度お試しください。\n通常モードに戻ります。",
            ),
          ),
        );
      return { changeMode: true, handleNext: false };
    }
  }
}
