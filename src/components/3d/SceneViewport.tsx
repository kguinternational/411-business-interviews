import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import type { AssetId, ControlState, SubComponentStatus } from '../../types/twin';
import { FactoryModel } from './FactoryModel';
import { TurbineModel } from './TurbineModel';
import { ServerRackModel } from './ServerRackModel';
import { Flame, Layers, RotateCcw } from 'lucide-react';

interface ViewportProps {
  assetId: AssetId;
  controlState: ControlState;
  components: SubComponentStatus[];
  onToggleThermal: () => void;
  onToggleExplosion: () => void;
  onSelectComponent: (id: string | null) => void;
}

export function SceneViewport({
  assetId,
  controlState,
  components,
  onToggleThermal,
  onToggleExplosion,
  onSelectComponent
}: ViewportProps) {
  const selectedComponent = components.find((c) => c.id === controlState.selectedComponentId);

  return (
    <div className="relative w-full h-[500px] bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl group">
      {/* HUD Top Bar Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 text-xs text-slate-300">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono font-medium tracking-wide">3D TWIN STREAM ACTIVE</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={onToggleThermal}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
              controlState.thermalMode
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 glow-rose'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Thermal IR Map
          </button>

          <button
            onClick={onToggleExplosion}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
              controlState.explosionView
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 glow-cyan'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Exploded View
          </button>

          <button
            onClick={() => onSelectComponent(null)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            title="Reset Component Focus"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive 3D Canvas */}
      <Canvas camera={{ position: [0, 2, 7], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0284c7" />

        {/* Dynamic Asset 3D Rendering */}
        {assetId === 'robotic_arm' && (
          <FactoryModel
            thermalMode={controlState.thermalMode}
            exploded={controlState.explosionView}
            selectedComponentId={controlState.selectedComponentId}
            onSelectComponent={onSelectComponent}
            isEmergencyStop={controlState.emergencyStop}
          />
        )}

        {assetId === 'wind_turbine' && (
          <TurbineModel
            thermalMode={controlState.thermalMode}
            exploded={controlState.explosionView}
            selectedComponentId={controlState.selectedComponentId}
            onSelectComponent={onSelectComponent}
            isEmergencyStop={controlState.emergencyStop}
          />
        )}

        {assetId === 'server_rack' && (
          <ServerRackModel
            thermalMode={controlState.thermalMode}
            exploded={controlState.explosionView}
            selectedComponentId={controlState.selectedComponentId}
            onSelectComponent={onSelectComponent}
            isEmergencyStop={controlState.emergencyStop}
            fanSpeed={controlState.fanSpeedOverride}
          />
        )}

        <Grid
          infiniteGrid
          fadeDistance={25}
          fadeStrength={5}
          cellColor={controlState.thermalMode ? '#f43f5e' : '#0284c7'}
          sectionColor={controlState.thermalMode ? '#fda4af' : '#38bdf8'}
          cellThickness={0.5}
          sectionThickness={1}
        />

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 2 + 0.1}
          minDistance={2}
          maxDistance={15}
        />
      </Canvas>

      {/* HUD Selected Component Detail Card Overlay */}
      {selectedComponent && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md p-4 rounded-xl border border-cyan-500/30 max-w-xs shadow-xl glow-cyan animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Component Inspection
            </span>
            <button
              onClick={() => onSelectComponent(null)}
              className="text-slate-500 hover:text-slate-300 text-xs font-mono"
            >
              [CLOSE]
            </button>
          </div>
          <h4 className="text-sm font-bold text-slate-100">{selectedComponent.name}</h4>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Health Index</span>
              <span className="font-mono text-emerald-400 font-bold">{selectedComponent.health}%</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Temperature</span>
              <span className="font-mono text-amber-400 font-bold">{selectedComponent.temperature}°C</span>
            </div>
          </div>
          <div className="mt-2 bg-slate-900 p-2 rounded border border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400 text-[10px]">Active Output:</span>
            <span className="font-mono text-cyan-300 font-medium">
              {selectedComponent.metricValue} {selectedComponent.unit}
            </span>
          </div>
        </div>
      )}

      {/* Watermark / Guidance Footer */}
      <div className="absolute bottom-4 right-4 z-10 text-[11px] font-mono text-slate-500 pointer-events-none bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800/50">
        [ROTATE: Left Drag] | [PAN: Right Drag] | [ZOOM: Scroll]
      </div>
    </div>
  );
}
