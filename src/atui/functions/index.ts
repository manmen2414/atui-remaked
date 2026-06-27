import { AtuiBaseFunction } from "./AtuiFunction";
export { AtuiBaseFunction };
import { NormalFunction } from "./normal";
export { NormalFunction };
import { PostFunction } from "./post";
export { PostFunction };
import { WeatherFunction } from "./weather";
export { WeatherFunction };
import { CalculatorFunction } from "./calculator";
export { CalculatorFunction };
import { FireFunction } from "./fire";
export { FireFunction };
import { HelpFunction } from "./help";
export { HelpFunction };
import { HimaFunction } from "./hima";
export { HimaFunction };
import { JankenFunction } from "./janken";
export { JankenFunction };
import { QRFunction } from "./qr";
export { QRFunction };
import { ShiritoriFunction } from "./shiritori";
export { ShiritoriFunction };
import { StudyFunction } from "./study";
export { StudyFunction };
import { FunctionsFunction } from "./functions";
export { FunctionsFunction };
import { TerminateFunction } from "./terminate";
export { TerminateFunction };
import { GekiatuCalculateFunction } from "./gekiatu-calculate";
export { GekiatuCalculateFunction };

export function generateAllFunction(): AtuiBaseFunction[] {
  return [
    new NormalFunction(),
    new PostFunction(),
    new WeatherFunction(),
    new CalculatorFunction(),
    new FireFunction(),
    new HelpFunction(),
    new HimaFunction(),
    new JankenFunction(),
    new QRFunction(),
    new ShiritoriFunction(),
    new StudyFunction(),
    new FunctionsFunction(),
    new TerminateFunction(),
    new GekiatuCalculateFunction(),
  ];
}
