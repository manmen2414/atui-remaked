export interface CustomNavigator extends Navigator {
  getBattery?(): Promise<BatteryManager>;
}

interface BatteryManager extends EventTarget {
  readonly charging: boolean;
  readonly chargingTime: number;
  readonly dischargingTime: number;
  readonly level: number;
}
