import { useState, useEffect, useCallback } from 'react';
import type { AssetId, DigitalTwinAsset, TelemetryPoint, AlarmItem, EventLog, ControlState } from '../types/twin';

const INITIAL_ASSETS: Record<AssetId, DigitalTwinAsset> = {
  robotic_arm: {
    id: 'robotic_arm',
    name: 'KUKA CyberArm FX-900',
    category: 'Industrial Automation',
    location: 'Factory Floor - Bay 04',
    description: 'Precision 6-axis articulated assembly robot with high payload capacity and adaptive feedback sensors.',
    status: 'optimal',
    healthScore: 96,
    overallRUL: 4320, // Hours
    specs: {
      'Payload Capacity': '120 kg',
      'Max Reach': '2100 mm',
      'Joint Repeatability': '±0.03 mm',
      'Operating Voltage': '480V 3-Phase'
    },
    components: [
      { id: 'joint_1', name: 'Base Rotary Actuator', health: 98, status: 'optimal', temperature: 42.1, metricValue: 45, unit: 'deg/s' },
      { id: 'joint_2', name: 'Lower Arm Hydraulics', health: 92, status: 'optimal', temperature: 48.5, metricValue: 310, unit: 'Bar' },
      { id: 'joint_3', name: 'Upper Arm Servo Motor', health: 95, status: 'optimal', temperature: 44.0, metricValue: 1850, unit: 'RPM' },
      { id: 'joint_4', name: 'Wrist Pitch & Yaw', health: 97, status: 'optimal', temperature: 39.8, metricValue: 120, unit: 'deg/s' },
      { id: 'end_effector', name: 'Vacuum Gripper Unit', health: 99, status: 'optimal', temperature: 35.2, metricValue: 88, unit: 'kPa' }
    ]
  },
  wind_turbine: {
    id: 'wind_turbine',
    name: 'Vesta Dynamics WT-5MW',
    category: 'Renewable Energy',
    location: 'Offshore Wind Farm Grid 12',
    description: '5MW Direct-Drive Offshore Wind Turbine with real-time blade pitch control and internal gearbox monitoring.',
    status: 'optimal',
    healthScore: 91,
    overallRUL: 8760,
    specs: {
      'Rated Power': '5.0 MW',
      'Rotor Diameter': '158 m',
      'Cut-in Wind Speed': '3.0 m/s',
      'Tower Height': '120 m'
    },
    components: [
      { id: 'blade_assembly', name: 'Rotor Blades (3x)', health: 94, status: 'optimal', temperature: 28.4, metricValue: 16.2, unit: 'RPM' },
      { id: 'gearbox', name: 'Epicyclic Gearbox', health: 88, status: 'warning', temperature: 68.2, metricValue: 4.8, unit: 'mm/s' },
      { id: 'generator', name: 'Permanent Magnet Gen', health: 93, status: 'optimal', temperature: 56.1, metricValue: 4200, unit: 'kW' },
      { id: 'yaw_bearing', name: 'Tower Yaw Mechanism', health: 96, status: 'optimal', temperature: 38.0, metricValue: 2.1, unit: 'deg/s' }
    ]
  },
  server_rack: {
    id: 'server_rack',
    name: 'QuantumBlade H-100 Pod',
    category: 'Data Center Infrastructure',
    location: 'Zone A - Rack 18',
    description: 'High-Density AI Compute Cluster sub-rack with liquid cooling loops and high-throughput network nodes.',
    status: 'optimal',
    healthScore: 98,
    overallRUL: 12000,
    specs: {
      'Compute Density': '8x GPU Acceleration Modules',
      'Power Draw': '14.2 kW',
      'Cooling Type': 'Hybrid Liquid/Air',
      'Network Uplink': '400 Gbps'
    },
    components: [
      { id: 'blade_1', name: 'Blade Module 01 (GPU Array)', health: 99, status: 'optimal', temperature: 62.0, metricValue: 88, unit: '% Load' },
      { id: 'blade_2', name: 'Blade Module 02 (Compute)', health: 97, status: 'optimal', temperature: 59.5, metricValue: 74, unit: '% Load' },
      { id: 'fan_array', name: 'PWM Exhaust Fan Matrix', health: 95, status: 'optimal', temperature: 34.0, metricValue: 5200, unit: 'RPM' },
      { id: 'psu_unit', name: 'Redundant Power Distribution', health: 100, status: 'optimal', temperature: 41.2, metricValue: 13.8, unit: 'kW' }
    ]
  }
};

export function useTelemetryEngine() {
  const [selectedAssetId, setSelectedAssetId] = useState<AssetId>('robotic_arm');
  const [assets] = useState<Record<AssetId, DigitalTwinAsset>>(INITIAL_ASSETS);
  const [telemetryHistory, setTelemetryHistory] = useState<Record<AssetId, TelemetryPoint[]>>({
    robotic_arm: [],
    wind_turbine: [],
    server_rack: []
  });

  const [alarms, setAlarms] = useState<AlarmItem[]>([
    {
      id: 'alm-001',
      assetId: 'wind_turbine',
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
      severity: 'warning',
      component: 'Epicyclic Gearbox',
      message: 'Gearbox bearing vibration elevated above 4.5 mm/s baseline threshold.',
      acknowledged: false
    }
  ]);

  const [eventLogs, setEventLogs] = useState<EventLog[]>([
    {
      id: 'log-101',
      timestamp: new Date(Date.now() - 600000).toLocaleTimeString(),
      assetId: 'robotic_arm',
      user: 'Operator (Engineer ID #482)',
      action: 'Calibration Check',
      details: 'Automated 6-axis laser homing completed successfully.',
      type: 'system'
    }
  ]);

  const [controlState, setControlState] = useState<ControlState>({
    emergencyStop: false,
    fanSpeedOverride: 80,
    thermalMode: false,
    explosionView: false,
    anomalyActive: false,
    anomalyType: null,
    selectedComponentId: null
  });

  // Seed initial telemetry buffer
  useEffect(() => {
    const now = Date.now();
    const initialHist: Record<AssetId, TelemetryPoint[]> = {
      robotic_arm: [],
      wind_turbine: [],
      server_rack: []
    };

    (['robotic_arm', 'wind_turbine', 'server_rack'] as AssetId[]).forEach((id) => {
      const points: TelemetryPoint[] = [];
      for (let i = 20; i >= 0; i--) {
        const time = new Date(now - i * 2000);
        let temp = 45 + Math.sin(i * 0.5) * 3;
        let vib = 2.0 + Math.cos(i * 0.3) * 0.5;
        let pwr = 12 + Math.sin(i * 0.8) * 1.5;
        let eff = 94 + Math.random() * 2;
        let pres = 300 + Math.random() * 10;
        let out = 42 + Math.sin(i) * 5;

        if (id === 'wind_turbine') {
          temp += 15;
          vib += 2.0;
          pwr = 4200 + Math.sin(i) * 300;
          out = 4.2;
        } else if (id === 'server_rack') {
          temp += 12;
          vib = 0.5 + Math.random() * 0.2;
          pwr = 14 + Math.sin(i) * 0.5;
          out = 380;
        }

        points.push({
          timestamp: time.toLocaleTimeString(),
          rawTime: time.getTime(),
          temperature: Number(temp.toFixed(1)),
          vibration: Number(vib.toFixed(2)),
          powerUsage: Number(pwr.toFixed(1)),
          efficiency: Number(eff.toFixed(1)),
          hydraulicPressure: Number(pres.toFixed(0)),
          outputMetric: Number(out.toFixed(1))
        });
      }
      initialHist[id] = points;
    });

    setTelemetryHistory(initialHist);
  }, []);

  const triggerAlarm = useCallback((assetId: AssetId, severity: 'critical' | 'warning', component: string, message: string) => {
    setAlarms((prev) => {
      if (prev.some((a) => a.assetId === assetId && a.message === message && !a.acknowledged)) {
        return prev;
      }
      return [
        {
          id: `alm-${Date.now().toString().slice(-4)}`,
          assetId,
          timestamp: new Date().toLocaleTimeString(),
          severity,
          component,
          message,
          acknowledged: false
        },
        ...prev.slice(0, 19)
      ];
    });
  }, []);

  // Live Telemetry Loop
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const timeStr = new Date(now).toLocaleTimeString();

      setTelemetryHistory((prev) => {
        const updated = { ...prev };

        (['robotic_arm', 'wind_turbine', 'server_rack'] as AssetId[]).forEach((id) => {
          const currentHist = prev[id] || [];
          const lastPoint = currentHist[currentHist.length - 1] || {
            temperature: 45,
            vibration: 2.0,
            powerUsage: 12,
            efficiency: 95,
            hydraulicPressure: 300,
            outputMetric: 40
          };

          let tempJitter = (Math.random() - 0.5) * 0.6;
          let vibJitter = (Math.random() - 0.5) * 0.1;
          let powerJitter = (Math.random() - 0.5) * 0.2;

          if (controlState.emergencyStop && id === selectedAssetId) {
            const newPoint: TelemetryPoint = {
              timestamp: timeStr,
              rawTime: now,
              temperature: Math.max(22, lastPoint.temperature - 0.8),
              vibration: Math.max(0, lastPoint.vibration - 0.5),
              powerUsage: 0.5,
              efficiency: 0,
              hydraulicPressure: Math.max(0, lastPoint.hydraulicPressure - 20),
              outputMetric: 0
            };
            updated[id] = [...currentHist.slice(-29), newPoint];
            return;
          }

          if (controlState.anomalyActive && id === selectedAssetId) {
            if (controlState.anomalyType === 'OVERHEAT') {
              tempJitter += 2.5;
            } else if (controlState.anomalyType === 'VIBRATION_SPIKE') {
              vibJitter += 1.8;
            } else if (controlState.anomalyType === 'POWER_SURGE') {
              powerJitter += 4.0;
            }
          }

          const newTemp = Number(Math.min(100, Math.max(20, lastPoint.temperature + tempJitter)).toFixed(1));
          const newVib = Number(Math.max(0, lastPoint.vibration + vibJitter).toFixed(2));
          const newPower = Number(Math.max(0, lastPoint.powerUsage + powerJitter).toFixed(1));
          const newEff = Number(Math.min(100, Math.max(50, lastPoint.efficiency + (Math.random() - 0.5))).toFixed(1));
          const newPres = Number(Math.max(100, lastPoint.hydraulicPressure + (Math.random() - 0.5) * 4).toFixed(0));
          const newOut = Number(Math.max(0, lastPoint.outputMetric + (Math.random() - 0.5) * 2).toFixed(1));

          const newPoint: TelemetryPoint = {
            timestamp: timeStr,
            rawTime: now,
            temperature: newTemp,
            vibration: newVib,
            powerUsage: newPower,
            efficiency: newEff,
            hydraulicPressure: newPres,
            outputMetric: newOut
          };

          updated[id] = [...currentHist.slice(-29), newPoint];

          if (newTemp > 75 && id === selectedAssetId) {
            triggerAlarm(id, 'critical', 'Thermal Alert', `Critical core temperature spike detected (${newTemp}°C).`);
          } else if (newVib > 6.0 && id === selectedAssetId) {
            triggerAlarm(id, 'warning', 'Vibration Anomaly', `Vibration exceeded safety limit (${newVib} mm/s).`);
          }
        });

        return updated;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [selectedAssetId, controlState, triggerAlarm]);

  const acknowledgeAlarm = useCallback((id: string) => {
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  }, []);

  const addEventLog = useCallback((assetId: AssetId, user: string, action: string, details: string, type: EventLog['type']) => {
    setEventLogs((prev) => [
      {
        id: `log-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString(),
        assetId,
        user,
        action,
        details,
        type
      },
      ...prev.slice(0, 49)
    ]);
  }, []);

  const toggleEmergencyStop = useCallback(() => {
    setControlState((prev) => {
      const newStop = !prev.emergencyStop;
      addEventLog(
        selectedAssetId,
        'Operator',
        newStop ? 'EMERGENCY STOP TRIGGERED' : 'System Reset from E-Stop',
        newStop ? 'Immediate actuator halt commanded by safety override.' : 'System restored to standard operational ready state.',
        'control'
      );
      return { ...prev, emergencyStop: newStop };
    });
  }, [selectedAssetId, addEventLog]);

  const setFanSpeed = useCallback((speed: number) => {
    setControlState((prev) => ({ ...prev, fanSpeedOverride: speed }));
    addEventLog(selectedAssetId, 'Operator', 'Cooling Fan RPM Adjusted', `Exhaust fan set to ${speed}%.`, 'control');
  }, [selectedAssetId, addEventLog]);

  const toggleThermalMode = useCallback(() => {
    setControlState((prev) => {
      const mode = !prev.thermalMode;
      addEventLog(selectedAssetId, 'Operator', '3D View Toggle', `Thermal Infrared Heatmap mode ${mode ? 'Enabled' : 'Disabled'}.`, 'system');
      return { ...prev, thermalMode: mode };
    });
  }, [selectedAssetId, addEventLog]);

  const toggleExplosionView = useCallback(() => {
    setControlState((prev) => {
      const mode = !prev.explosionView;
      addEventLog(selectedAssetId, 'Operator', '3D CAD Toggle', `Exploded Component Structural View ${mode ? 'Active' : 'Inactive'}.`, 'system');
      return { ...prev, explosionView: mode };
    });
  }, [selectedAssetId, addEventLog]);

  const injectAnomaly = useCallback((type: 'OVERHEAT' | 'VIBRATION_SPIKE' | 'POWER_SURGE') => {
    setControlState((prev) => ({
      ...prev,
      anomalyActive: true,
      anomalyType: type
    }));
    addEventLog(selectedAssetId, 'Simulator Engine', 'Anomaly Injection', `Simulated failure event injected: ${type}`, 'anomaly');
  }, [selectedAssetId, addEventLog]);

  const clearAnomaly = useCallback(() => {
    setControlState((prev) => ({
      ...prev,
      anomalyActive: false,
      anomalyType: null
    }));
    addEventLog(selectedAssetId, 'Simulator Engine', 'Anomaly Cleared', 'System returned to nominal simulation telemetry parameters.', 'anomaly');
  }, [selectedAssetId, addEventLog]);

  const selectComponent = useCallback((componentId: string | null) => {
    setControlState((prev) => ({ ...prev, selectedComponentId: componentId }));
  }, []);

  return {
    selectedAssetId,
    setSelectedAssetId,
    currentAsset: assets[selectedAssetId],
    allAssets: assets,
    currentTelemetryHistory: telemetryHistory[selectedAssetId] || [],
    alarms,
    acknowledgeAlarm,
    eventLogs,
    controlState,
    toggleEmergencyStop,
    setFanSpeed,
    toggleThermalMode,
    toggleExplosionView,
    injectAnomaly,
    clearAnomaly,
    selectComponent
  };
}
