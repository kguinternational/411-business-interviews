import type { TelemetryPoint } from '../../types/twin';
import { Activity, Gauge, Flame, Zap, BarChart2 } from 'lucide-react';

interface ChartsProps {
  history: TelemetryPoint[];
}

export function TelemetryCharts({ history }: ChartsProps) {
  const latest = history[history.length - 1] || {
    temperature: 0,
    vibration: 0,
    powerUsage: 0,
    efficiency: 0,
    hydraulicPressure: 0,
    outputMetric: 0
  };

  const renderSparklineSVG = (
    dataKey: keyof TelemetryPoint,
    strokeColor: string,
    minVal?: number,
    maxVal?: number
  ) => {
    if (history.length < 2) return null;

    const values = history.map((h) => Number(h[dataKey]) || 0);
    const min = minVal ?? Math.min(...values);
    const max = maxVal ?? Math.max(...values);
    const range = max - min || 1;

    const width = 280;
    const height = 50;

    const points = values
      .map((val, idx) => {
        const x = (idx / (values.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 8) - 4;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <div className="relative w-full h-[55px] mt-2 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wider text-slate-300 font-mono uppercase flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          Real-Time Sensor Telemetry Matrix
        </h3>
        <span className="text-[11px] font-mono text-slate-500">2000ms SAMPLING RATE</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Core Temperature */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Core Temp
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">{latest.temperature}°C</span>
          </div>
          {renderSparklineSVG('temperature', '#f59e0b')}
          <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>20°C Normal</span>
            <span>Threshold: 75°C</span>
          </div>
        </div>

        {/* Card 2: Vibration / Dynamics */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Vibration Dynamics
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">{latest.vibration} mm/s</span>
          </div>
          {renderSparklineSVG('vibration', '#06b6d4')}
          <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Nominal: &lt; 3.0</span>
            <span>Limit: 6.0 mm/s</span>
          </div>
        </div>

        {/* Card 3: Active Power Draw */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Power Load
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">{latest.powerUsage} kW</span>
          </div>
          {renderSparklineSVG('powerUsage', '#10b981')}
          <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Grid Feed Active</span>
            <span>Eff: {latest.efficiency}%</span>
          </div>
        </div>

        {/* Card 4: Operating Pressure / Output */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-purple-400" /> System Pressure
            </span>
            <span className="text-xs font-mono font-bold text-purple-400">{latest.hydraulicPressure} Bar</span>
          </div>
          {renderSparklineSVG('hydraulicPressure', '#c084fc')}
          <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Pneumatic Auxiliary</span>
            <span>Target: 300 Bar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
