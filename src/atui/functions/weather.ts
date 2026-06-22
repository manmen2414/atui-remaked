import { Atui } from "..";
import { CITY_CODE_TABLE } from "../constants";
import { AtuiResponseBuilder } from "../ResponseBuilder";
import { escapeMarkdown } from "../util";
import { AtuiBaseFunction, HandlerResult } from "./AtuiFunction";

export class WeatherFunction extends AtuiBaseFunction {
  description: string = `特定の地域を取得します。`;
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
        '都道府県名または地域コードを入力してください。地域コード表を表示する場合は"コード"と入力してください。',
      ),
    );
    return { handleNext: false, changeMode: true };
  }

  async funcModeHandler(
    atui: Atui,
    resBuilder: AtuiResponseBuilder,
  ): Promise<HandlerResult> {
    const content = resBuilder.req.content;
    if (content.includes("コード")) {
      await atui._emitRes(
        resBuilder.md(
          "地域コード表を新規タブで開きます。\n都道府県名または地域コードを入力してください。",
        ),
      );
      await atui._emitRes(
        resBuilder.page("https://weather.tsukumijima.net/primary_area.xml"),
      );
      return { handleNext: false, changeMode: false };
    } else {
      let cityName = "";
      let cityId = "";
      for (const [city, id] of Object.entries(CITY_CODE_TABLE)) {
        if (
          content.includes(city) ||
          content.includes(id) ||
          content.includes(city.slice(0, -1))
        ) {
          cityName = city;
          cityId = id;
        }
      }
      if (!cityId) {
        await atui._emitRes(
          resBuilder.md(
            "都道府県が見つかりませんでした。通常モードに戻ります。",
          ),
        );
        return { handleNext: false, changeMode: true };
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
