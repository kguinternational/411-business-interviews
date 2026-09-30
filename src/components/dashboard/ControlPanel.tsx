import type { ControlState } from '../../types/twin';
import { AlertTriangle, Power, Fan, ShieldAlert, Sliders, RefreshCw } from 'lucide-react';

interface ControlProps {
  controlState: ControlState;
  onToggleEStop: () => void;
  onSetFanSpeed: (speed: number) => void;
  onInjectAnomaly: (type: 'OVERHEAT' | 'VIBRATION_SPIKE' | 'POWER_SURGE') => void;
  onClearAnomaly: () => void;
}

export function ControlPanel({
  controlState,
  onToggleEStop,
  onSetFanSpeed,
  onInjectAnomaly,
  onClearAnomaly
}: ControlProps) {
  return (
    <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold tracking-wider text-slate-200 font-mono uppercase flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Edge Actuation & Control Overrides
        </h3>
        <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded">
          COMMAND LEVEL 3
        </span>
      </div>

      {/* Primary Emergency Halt Button */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Power className="w-4 h-4 text-rose-500" /> Safety Emergency Shutdown (E-STOP)
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Instantly cuts motor power feeds and locks physical brake actuators in place.
          </p>
        </div>
        <button
          onClick={onToggleEStop}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
            controlState.emergencyStop
              ? 'bg-rose-500 hover:bg-rose-600 text-slate-950 glow-rose animate-pulse'
              : 'bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-400'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          {controlState.emergencyStop ? 'SYSTEM HALTED - DISENGAGE E-STOP' : 'ENGAGE EMERGENCY STOP'}
        </button>
      </div>

      {/* Variable Actuation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fan Speed Slider */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-300 flex items-center gap-1.5 font-mono">
              <Fan className="w-3.5 h-3.5 text-cyan-400" /> Exhaust Cooling Fan Duty
            </span>
            <span className="font-mono text-cyan-400 font-bold">{controlState.fanSpeedOverride}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={controlState.fanSpeedOverride}
            onChange={(e) => onSetFanSpeed(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>OFF (0%)</span>
            <span>AUTO (80%)</span>
            <span>MAX (100%)</span>
          </div>
        </div>

        {/* Anomaly Simulation Suite */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-300 flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Digital Twin Fault Injection
            </span>
            {controlState.anomalyActive && (
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                FAULT ACTIVE
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={() => onInjectAnomaly('OVERHEAT')}
              className="px-2 py-1.5 rounded text-[11px] font-mono bg-rose-950/40 border border-rose-800/60 text-rose-300 hover:bg-rose-900/60 transition-all text-center"
            >
              Overheat
            </button>
            <button
              onClick={() => onInjectAnomaly('VIBRATION_SPIKE')}
              className="px-2 py-1.5 rounded text-[11px] font-mono bg-amber-950/40 border border-amber-800/60 text-amber-300 hover:bg-amber-900/60 transition-all text-center"
            >
              Vibration
            </button>
            <button
              onClick={() => onInjectAnomaly('POWER_SURGE')}
              className="px-2 py-1.5 rounded text-[11px] font-mono bg-purple-950/40 border border-purple-800/60 text-purple-300 hover:bg-purple-900/60 transition-all text-center"
            >
              Power Surge
            </button>
          </div>

          {controlState.anomalyActive && (
            <button
              onClick={onClearAnomaly}
              className="w-full mt-2 py-1 rounded text-xs font-mono bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900/80 transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Clear Active Anomaly Simulation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
