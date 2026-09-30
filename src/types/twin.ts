export type AssetId = 'robotic_arm' | 'wind_turbine' | 'server_rack';

export type AssetStatus = 'optimal' | 'warning' | 'critical' | 'offline';

export interface SubComponentStatus {
  id: string;
  name: string;
  health: number; // 0 to 100
  status: AssetStatus;
  temperature: number; // Celsius
  metricValue: number; // e.g. RPM, Load %, Fan Speed
  unit: string;
}

export interface DigitalTwinAsset {
  id: AssetId;
  name: string;
  category: string;
  location: string;
  description: string;
  status: AssetStatus;
  healthScore: number; // 0 - 100%
  overallRUL: number; // Remaining Useful Life in hours
  components: SubComponentStatus[];
  specs: Record<string, string | number>;
}

export interface TelemetryPoint {
  timestamp: string;
  rawTime: number;
  temperature: number;
  vibration: number; // mm/s or RPM
  powerUsage: number; // kW
  efficiency: number; // %
  hydraulicPressure: number; // Bar or PSI
  outputMetric: number; // Units produced / Wind generation kW / Network throughput Gbps
}

export interface AlarmItem {
  id: string;
  assetId: AssetId;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  component: string;
  message: string;
  acknowledged: boolean;
}

export interface EventLog {
  id: string;
  timestamp: string;
  assetId: AssetId;
  user: string;
  action: string;
  details: string;
  type: 'control' | 'system' | 'alarm' | 'anomaly';
}

export interface ControlState {
  emergencyStop: boolean;
  fanSpeedOverride: number; // 0 - 100%
  thermalMode: boolean;
  explosionView: boolean;
  anomalyActive: boolean;
  anomalyType: 'OVERHEAT' | 'VIBRATION_SPIKE' | 'POWER_SURGE' | null;
  selectedComponentId: string | null;
}
