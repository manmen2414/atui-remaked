import { Atui } from "../atui";
import { AtuiInAtuiFunction } from "./modifys/atui-in-atui";

export function webModifyToAtui(atui: Atui) {
  atui.addFunction(new AtuiInAtuiFunction());
}
