import { Atui } from "./atui";
import { AtuiBaseFunction } from "./atui/functions/AtuiFunction";

declare global {
  interface Window {
    addFunction(func: AtuiBaseFunction): void;
    atui: Atui;
  }
}
