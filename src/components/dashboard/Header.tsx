import type { AssetId, DigitalTwinAsset } from '../../types/twin';
import { Activity, Radio, ShieldCheck, Server, Wind, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  currentAsset: DigitalTwinAsset;
  allAssets: Record<AssetId, DigitalTwinAsset>;
  onSelectAsset: (id: AssetId) => void;
  isEmergencyStop: boolean;
}

export function Header({
  currentAsset,
  allAssets,
  onSelectAsset,
  isEmergencyStop
}: HeaderProps) {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const update = () => setTimeStr(new Date().toUTCString().slice(17, 25) + ' UTC');
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const getAssetIcon = (id: AssetId) => {
    switch (id) {
      case 'robotic_arm':
        return <Bot className="w-4 h-4" />;
      case 'wind_turbine':
        return <Wind className="w-4 h-4" />;
      case 'server_rack':
        return <Server className="w-4 h-4" />;
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Telemetry Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-100 font-sans">
                  DigitalTwin<span className="text-cyan-400">.io</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/80 px-1.5 py-0.5 rounded">
                  v2.4 REALTIME
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Enterprise Asset Visualizer & Operations Engine</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs">
              <Radio className={`w-3.5 h-3.5 ${isEmergencyStop ? 'text-rose-500 animate-ping' : 'text-emerald-400 animate-pulse'}`} />
              <span className="text-slate-300 font-mono">
                {isEmergencyStop ? 'E-STOP HALT' : 'MQTT / WebSockets Connected'}
              </span>
            </div>
          </div>
        </div>

        {/* Asset Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {(Object.keys(allAssets) as AssetId[]).map((id) => {
            const asset = allAssets[id];
            const isActive = asset.id === currentAsset.id;
            return (
              <button
                key={id}
                onClick={() => onSelectAsset(id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {getAssetIcon(id)}
                <span>{asset.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* System Time & Security State */}
        <div className="hidden xl:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SECURE EDGE NODE</span>
          </div>
          <div className="text-cyan-400 font-bold bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-900/50">
            {timeStr || '12:00:00 UTC'}
          </div>
        </div>
      </div>
    </header>
  );
}
