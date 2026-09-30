import { useTelemetryEngine } from './hooks/useTelemetryEngine';
import { Header } from './components/dashboard/Header';
import { SceneViewport } from './components/3d/SceneViewport';
import { TelemetryCharts } from './components/dashboard/TelemetryCharts';
import { ControlPanel } from './components/dashboard/ControlPanel';
import { AlarmCenter } from './components/dashboard/AlarmCenter';
import { EventLogs } from './components/dashboard/EventLogs';
import { Cpu, Layers, Sparkles } from 'lucide-react';

export default function App() {
  const {
    selectedAssetId,
    setSelectedAssetId,
    currentAsset,
    allAssets,
    currentTelemetryHistory,
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
  } = useTelemetryEngine();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Navigation */}
      <Header
        currentAsset={currentAsset}
        allAssets={allAssets}
        onSelectAsset={setSelectedAssetId}
        isEmergencyStop={controlState.emergencyStop}
      />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Asset Operational Summary Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  {currentAsset.category}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-mono text-slate-400">{currentAsset.location}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 mt-1">{currentAsset.name}</h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">{currentAsset.description}</p>
            </div>

            <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6 shrink-0">
              <div className="text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Asset Health</span>
                <span
                  className={`text-2xl font-black font-mono ${
                    currentAsset.healthScore > 90
                      ? 'text-emerald-400'
                      : currentAsset.healthScore > 75
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {currentAsset.healthScore}%
                </span>
              </div>
              <div className="text-center pl-4 border-l border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Est. RUL</span>
                <span className="text-2xl font-black font-mono text-cyan-400">{currentAsset.overallRUL}h</span>
              </div>
            </div>
          </div>

          {/* Quick Specs Widget */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-300 font-mono uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Twin Hardware Profile
            </span>
            <div className="mt-2 space-y-1.5 text-xs font-mono">
              {Object.entries(currentAsset.specs).map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-slate-500 text-[11px]">{key}:</span>
                  <span className="text-slate-200 font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Visual Twin & Remote Controls Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 3D Scene Viewport (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <SceneViewport
              assetId={selectedAssetId}
              controlState={controlState}
              components={currentAsset.components}
              onToggleThermal={toggleThermalMode}
              onToggleExplosion={toggleExplosionView}
              onSelectComponent={selectComponent}
            />

            {/* Sub-Components Breakdown Table */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold tracking-wider text-slate-200 font-mono uppercase mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Sub-Component Health & Status Matrix
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentAsset.components.map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => selectComponent(comp.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      controlState.selectedComponentId === comp.id
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 glow-cyan'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold">{comp.name}</span>
                      <span className="font-mono text-[10px] text-emerald-400">{comp.health}% Health</span>
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Temp: {comp.temperature}°C</span>
                      <span>
                        {comp.metricValue} {comp.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Controls & Live Alarms (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <ControlPanel
              controlState={controlState}
              onToggleEStop={toggleEmergencyStop}
              onSetFanSpeed={setFanSpeed}
              onInjectAnomaly={injectAnomaly}
              onClearAnomaly={clearAnomaly}
            />

            <AlarmCenter
              alarms={alarms}
              currentAssetId={selectedAssetId}
              onAcknowledge={acknowledgeAlarm}
            />
          </div>
        </div>

        {/* Bottom Section: Live Charts & Audit Logs */}
        <div className="space-y-6">
          <TelemetryCharts history={currentTelemetryHistory} />
          <EventLogs logs={eventLogs} currentAssetId={selectedAssetId} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>DigitalTwin.io — Industrial Cyber-Physical Telemetry Platform</span>
          </div>
          <span>Latency: 12ms | WebGL 2.0 Canvas Operational</span>
        </div>
      </footer>
    </div>
  );
}
