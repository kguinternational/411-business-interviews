import type { AlarmItem, AssetId } from '../../types/twin';
import { Bell, AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AlarmProps {
  alarms: AlarmItem[];
  currentAssetId: AssetId;
  onAcknowledge: (id: string) => void;
}

export function AlarmCenter({ alarms, currentAssetId, onAcknowledge }: AlarmProps) {
  const assetAlarms = alarms.filter((a) => a.assetId === currentAssetId);

  return (
    <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold tracking-wider text-slate-200 font-mono uppercase flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          Active Incident & Alarm Feed
        </h3>
        <span className="text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
          {assetAlarms.filter((a) => !a.acknowledged).length} UNACKNOWLEDGED
        </span>
      </div>

      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
        {assetAlarms.length === 0 ? (
          <div className="p-6 text-center text-slate-500 font-mono text-xs bg-slate-950/40 rounded-xl border border-slate-800/50">
            [NOMINAL STATE] No active alarm events detected for this asset.
          </div>
        ) : (
          assetAlarms.map((alarm) => {
            const isCritical = alarm.severity === 'critical';
            return (
              <div
                key={alarm.id}
                className={`p-3 rounded-xl border flex items-start justify-between gap-3 transition-all ${
                  alarm.acknowledged
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : isCritical
                    ? 'bg-rose-950/40 border-rose-800/80 text-rose-200 glow-rose'
                    : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isCritical ? (
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold uppercase">{alarm.component}</span>
                      <span className="text-[10px] font-mono opacity-70">[{alarm.timestamp}]</span>
                    </div>
                    <p className="text-xs mt-0.5 text-slate-300 font-sans">{alarm.message}</p>
                  </div>
                </div>

                {!alarm.acknowledged ? (
                  <button
                    onClick={() => onAcknowledge(alarm.id)}
                    className="shrink-0 text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 transition-all"
                  >
                    ACK
                  </button>
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
