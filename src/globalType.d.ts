import { Atui } from ".";
import { AtuiBaseFunction } from "./functions/AtuiFunction";

declare global {
  interface Window {
    addFunction(func: AtuiBaseFunction): void;
    atui: Atui;
  }
}
