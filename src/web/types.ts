export interface CustomNavigator extends Navigator {
  getBattery?(): Promise<BatteryManager>;
}

interface BatteryManager extends EventTarget {
  readonly charging: boolean;
  readonly chargingTime: number;
  readonly dischargingTime: number;
  readonly level: number;
}

import { AtuiCustomResponse } from "../atui/types";

export interface AtuiHtmlResponse extends AtuiCustomResponse {
  customId: "web_html";
  serialiseable: false;
  content: {
    authentication: Window;
    html: string;
  };
}
