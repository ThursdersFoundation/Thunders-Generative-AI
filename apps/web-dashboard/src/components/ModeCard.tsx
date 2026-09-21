import React, { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  Zap,
  Activity,
  Gauge,
  Sliders,
  Play,
  Copy,
  Check,
  Star,
  Terminal,
  Layers,
  Server,
  Settings2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Info,
  ExternalLink,
  Code2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  Search,
  Filter,
  LayoutGrid,
  List,
  SlidersHorizontal
} from 'lucide-react';

export type ModeStatus = 'online' | 'maintenance' | 'beta' | 'deprecated';
export type DisplayViewMode = 'grid' | 'list' | 'compact' | 'expanded';
export type HardwareAccelType = 'TensorRT' | 'CUDA' | 'vLLM' | 'Triton-Inference' | 'DirectML';

export interface ModelMetrics {
  latencyMs: number;            // P95 Latency in milliseconds
  throughputTps: number;        // Tokens or frames per second
  vramAllocatedGb: number;      // Currently allocated VRAM
  vramTotalGb: number;          // Total GPU VRAM capacity
  systemLoadPercent: number;    // Compute utilization (0-100)
  gpuClusterNodes: number;      // Number of active backing nodes
  hardwareAccel: HardwareAccelType;
  gpuType: string;              // e.g. "NVIDIA H100 SXM5 80GB"
}

export interface ModelParameterConfig {
  name: string;
  key: string;
  type: 'slider' | 'select' | 'toggle';
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number | string | boolean;
  options?: string[];
  description: string;
}

export interface GenerativeModeData {
  id: string;
  name: string;
  category: 'LLM Text' | 'Vision & Image' | 'Code Generation' | '3D Synthesis' | 'Audio & Speech';
  version: string;
  description: string;
  status: ModeStatus;
  isFavorite?: boolean;
  isActive?: boolean;
  apiEndpoint: string;
  tags: string[];
  metrics: ModelMetrics;
  parameters: ModelParameterConfig[];
  sampleOutput?: string;
  documentationUrl?: string;
}

export interface ModeCardProps {
  mode: GenerativeModeData;
  viewMode?: DisplayViewMode;
  onToggleActive?: (id: string, active: boolean) => void;
  onToggleFavorite?: (id: string, favorite: boolean) => void;
  onRunBenchmark?: (id: string) => void;
  onExecuteTest?: (id: string, params: Record<string, any>) => Promise<any>;
  className?: string;
}

const getStatusBadge = (status: ModeStatus) => {
  switch (status) {
    case 'online':
      return {
        label: 'SYSTEM ONLINE',
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        dot: 'bg-emerald-400 animate-pulse',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]'
      };
    case 'maintenance':
      return {
        label: 'MAINTENANCE',
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        dot: 'bg-amber-400',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]'
      };
    case 'beta':
      return {
        label: 'BETA PIPELINE',
        bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
        dot: 'bg-cyan-400 animate-ping',
        glow: 'shadow-[0_0_12px_rgba(6,182,212,0.25)]'
      };
    case 'deprecated':
      return {
        label: 'DEPRECATED',
        bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        dot: 'bg-rose-400',
        glow: 'shadow-[0_0_12px_rgba(244,63,94,0.25)]'
      };
    default:
      return {
        label: 'UNKNOWN',
        bg: 'bg-slate-800 text-slate-400 border-slate-700',
        dot: 'bg-slate-400',
        glow: ''
      };
  }
};

export const ModeCard: React.FC<ModeCardProps> = ({
  mode,
  viewMode: initialViewMode = 'grid',
  onToggleActive,
  onToggleFavorite,
  onRunBenchmark,
  onExecuteTest,
  className = '',
}) => {
  const [currentViewMode, setCurrentViewMode] = useState<DisplayViewMode>(initialViewMode);
  const [isFavorite, setIsFavorite] = useState<boolean>(mode?.isFavorite || false);
  const [isActive, setIsActive] = useState<boolean>(mode?.isActive ?? true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [benchmarking, setBenchmarking] = useState<boolean>(false);

  // Dynamic Parameter State Simulator safely initialized
  const [paramValues, setParamValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    if (mode && Array.isArray(mode.parameters)) {
      mode.parameters.forEach((p) => {
        if (p && p.key) {
          initial[p.key] = p.defaultValue ?? '';
        }
      });
    }
    return initial;
  });

  useEffect(() => {
    setCurrentViewMode(initialViewMode);
  }, [initialViewMode]);

  const statusConfig = useMemo(() => getStatusBadge(mode?.status || 'online'), [mode?.status]);

  const handleCopyEndpoint = () => {
    if (mode?.apiEndpoint) {
      navigator.clipboard.writeText(mode.apiEndpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFavoriteToggle = () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    if (onToggleFavorite && mode?.id) onToggleFavorite(mode.id, nextState);
  };

  const handleActiveToggle = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    if (onToggleActive && mode?.id) onToggleActive(mode.id, nextState);
  };

  const handleParamChange = (key: string, value: any) => {
    setParamValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleRunPlayground = async () => {
    setIsTesting(true);
    setTestOutput(null);
    try {
      if (onExecuteTest && mode?.id) {
        const res = await onExecuteTest(mode.id, paramValues);
        setTestOutput(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        setTestOutput(
          mode?.sampleOutput ||
            JSON.stringify(
              {
                status: '200 OK',
                latency: `${mode?.metrics?.latencyMs || 24}ms`,
                tokensGenerated: 412,
                hardwareNode: mode?.metrics?.gpuType || 'NVIDIA H100 SXM5',
                parametersUsed: paramValues,
                output: 'Generative pipeline executed successfully with 99.6% accuracy.'
              },
              null,
              2
            )
        );
      }
    } catch (err: any) {
      setTestOutput(`Error executing model mode pipeline: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleBenchmarkClick = () => {
    setBenchmarking(true);
    if (onRunBenchmark && mode?.id) onRunBenchmark(mode.id);
    setTimeout(() => setBenchmarking(false), 1600);
  };

  const vramPercentage = useMemo(() => {
    if (!mode?.metrics?.vramAllocatedGb || !mode?.metrics?.vramTotalGb) return 0;
    return Math.min(100, Math.round((mode.metrics.vramAllocatedGb / mode.metrics.vramTotalGb) * 100));
  }, [mode?.metrics?.vramAllocatedGb, mode?.metrics?.vramTotalGb]);

  if (currentViewMode === 'compact') {
    return (
      <div
        className={`group relative flex items-center justify-between p-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-100 text-sm tracking-tight">{mode.name}</h4>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                v{mode.version}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>{mode.metrics.hardwareAccel}</span>
              <span>•</span>
              <span className="text-emerald-400">{mode.metrics.latencyMs}ms</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border ${statusConfig.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig.dot}`} />
            {String(statusConfig.label)}
          </span>

          <button
            onClick={handleRunPlayground}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 transition-colors"
            title="Quick Test"
          >
            <Play className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (currentViewMode === 'list') {
    return (
      <div
        className={`relative flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 gap-4 ${className}`}
      >
        <div className="flex items-center gap-4 min-w-[260px]">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 tracking-tight">{mode.name}</h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                {mode.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-1 mt-1 max-w-md">{mode.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 w-full md:w-auto">
          <div className="text-center px-2">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Latency</span>
            <span className="text-xs font-bold font-mono text-emerald-400">{mode.metrics.latencyMs} ms</span>
          </div>
          <div className="text-center px-2 border-x border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Throughput</span>
            <span className="text-xs font-bold font-mono text-cyan-400">{mode.metrics.throughputTps} t/s</span>
          </div>
          <div className="text-center px-2">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">VRAM</span>
            <span className="text-xs font-bold font-mono text-purple-400">
              {mode.metrics.vramAllocatedGb}/{mode.metrics.vramTotalGb}GB
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto justify-end">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono border ${statusConfig.bg}`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${statusConfig.dot}`} />
            {String(statusConfig.label)}
          </span>

          <button
            onClick={() => setCurrentViewMode('expanded')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-medium transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            Config & Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 backdrop-blur-2xl border ${
        isActive ? 'border-slate-800 hover:border-cyan-500/50' : 'border-rose-900/30 opacity-75'
      } transition-all duration-300 shadow-xl overflow-hidden ${className}`}
    >
      <div
        className={`h-1 w-full bg-gradient-to-r ${
          mode.status === 'online'
            ? 'from-cyan-500 via-emerald-500 to-blue-500'
            : mode.status === 'beta'
            ? 'from-cyan-400 via-purple-500 to-pink-500'
            : 'from-amber-500 to-rose-500'
        }`}
      />

      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-cyan-400 shadow-inner group-hover:scale-105 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">{mode.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                  v{mode.version}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400 mt-0.5 block">{mode.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleFavoriteToggle}
              className={`p-2 rounded-lg border transition-all ${
                isFavorite
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Bookmark Mode"
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={handleActiveToggle}
              className={`p-2 rounded-lg border transition-all ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
              title={isActive ? 'Deactivate Route' : 'Activate Route'}
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 mt-3 leading-relaxed">{mode.description}</p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {Array.isArray(mode.tags) &&
            mode.tags.map((tag) => (
              <span
                key={typeof tag === 'string' ? tag : String(tag)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/50"
              >
                #{typeof tag === 'string' ? tag : String(tag)}
              </span>
            ))}
        </div>
      </div>

      <div className="p-5 bg-slate-950/40 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            Node Engine
          </span>
          <span className="text-slate-200 font-semibold">{mode.metrics.gpuType}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-emerald-400" /> Latency (P95)
              </span>
            </div>
            <p className="text-base font-bold font-mono text-emerald-400 mt-1">{mode.metrics.latencyMs} ms</p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" /> Throughput
              </span>
            </div>
            <p className="text-base font-bold font-mono text-cyan-400 mt-1">{mode.metrics.throughputTps} t/s</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-purple-400" /> VRAM Allocation
            </span>
            <span className="text-slate-300">
              {mode.metrics.vramAllocatedGb} / {mode.metrics.vramTotalGb} GB ({vramPercentage}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                vramPercentage > 85
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-500'
              }`}
              style={{ width: `${vramPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {currentViewMode === 'expanded' && (
        <div className="p-5 bg-slate-950/80 border-t border-slate-800 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold font-mono uppercase text-cyan-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> Mode Hyperparameters Simulator
            </h4>
            <span className="text-[10px] font-mono text-slate-500">Live Client Playground</span>
          </div>

          <div className="space-y-3">
            {Array.isArray(mode.parameters) &&
              mode.parameters.map((param) => (
                <div key={param.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">{param.name}</span>
                    <span className="text-cyan-400">
                      {typeof paramValues[param.key] === 'object'
                        ? JSON.stringify(paramValues[param.key])
                        : String(paramValues[param.key] ?? '')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">{param.description}</p>

                  {param.type === 'slider' && (
                    <input
                      type="range"
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      value={Number(paramValues[param.key] ?? param.defaultValue)}
                      onChange={(e) => handleParamChange(param.key, parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                    />
                  )}

                  {param.type === 'select' && (
                    <select
                      value={String(paramValues[param.key] ?? '')}
                      onChange={(e) => handleParamChange(param.key, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:ring-1 focus:ring-cyan-500 outline-none font-mono"
                    >
                      {param.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
          </div>

          {testOutput && (
            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-40">
              <div className="flex items-center gap-1.5 text-slate-400 border-b border-slate-800 pb-1 mb-2 text-[10px]">
                <Terminal className="w-3 h-3 text-emerald-400" /> Pipeline Terminal Response
              </div>
              <pre className="whitespace-pre-wrap">{String(testOutput)}</pre>
            </div>
          )}
        </div>
      )}

      <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyEndpoint}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Copy API Endpoint"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleBenchmarkClick}
            disabled={benchmarking}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Trigger Benchmark"
          >
            <RefreshCw className={`w-4 h-4 ${benchmarking ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={() => setCurrentViewMode(currentViewMode === 'expanded' ? 'grid' : 'expanded')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title={currentViewMode === 'expanded' ? 'Collapse Interactive Panel' : 'Expand Playground'}
          >
            {currentViewMode === 'expanded' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={handleRunPlayground}
          disabled={isTesting || !isActive}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
            isActive
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isTesting ? 'animate-bounce' : ''}`} />
          {isTesting ? 'EXECUTING...' : 'RUN PLAYGROUND'}
        </button>
      </div>
    </div>
  );
};

const MOCK_MODES: GenerativeModeData[] = [
  {
    id: 'mode-1',
    name: 'Thunders Code Synthesis LLM',
    category: 'Code Generation',
    version: '3.4-Turbo',
    description: 'High-throughput code completion model fine-tuned on Rust, React, and CUDA kernels.',
    status: 'online',
    isFavorite: true,
    isActive: true,
    apiEndpoint: 'https://api.thunders.ai/v1/codegen/complete',
    tags: ['Code', 'Rust', 'TypeScript', 'Inference'],
    metrics: {
      latencyMs: 14,
      throughputTps: 185,
      vramAllocatedGb: 64,
      vramTotalGb: 80,
      systemLoadPercent: 78,
      gpuClusterNodes: 8,
      hardwareAccel: 'vLLM',
      gpuType: 'NVIDIA H100 SXM5 80GB'
    },
    parameters: [
      {
        name: 'Temperature',
        key: 'temperature',
        type: 'slider',
        min: 0,
        max: 1,
        step: 0.05,
        defaultValue: 0.2,
        description: 'Controls randomness in syntax generation.'
      },
      {
        name: 'Context Window',
        key: 'contextLength',
        type: 'select',
        defaultValue: '32k',
        options: ['8k', '16k', '32k', '128k'],
        description: 'Active token context buffer capacity.'
      }
    ]
  },
  {
    id: 'mode-2',
    name: 'Aether 3D Mesh Synthesis',
    category: '3D Synthesis',
    version: '2.1-Alpha',
    description: 'Neural radiance field (NeRF) to high-poly 3D mesh generator for real-time game engines.',
    status: 'beta',
    isFavorite: false,
    isActive: true,
    apiEndpoint: 'https://api.thunders.ai/v1/3d/synthesize',
    tags: ['3D', 'NeRF', 'GLTF', 'Mesh'],
    metrics: {
      latencyMs: 42,
      throughputTps: 45,
      vramAllocatedGb: 72,
      vramTotalGb: 80,
      systemLoadPercent: 91,
      gpuClusterNodes: 4,
      hardwareAccel: 'TensorRT',
      gpuType: 'NVIDIA A100 80GB'
    },
    parameters: [
      {
        name: 'Poly Density',
        key: 'polyCount',
        type: 'slider',
        min: 1000,
        max: 50000,
        step: 1000,
        defaultValue: 15000,
        description: 'Target polygon output resolution.'
      }
    ]
  },
  {
    id: 'mode-3',
    name: 'HyperVision Diffusion Engine',
    category: 'Vision & Image',
    version: '4.0-XL',
    description: 'Ultra-low latency photorealistic image and vector visual model with controlnet bindings.',
    status: 'online',
    isFavorite: true,
    isActive: true,
    apiEndpoint: 'https://api.thunders.ai/v1/vision/diffuse',
    tags: ['Image', 'Diffusion', 'ControlNet'],
    metrics: {
      latencyMs: 28,
      throughputTps: 92,
      vramAllocatedGb: 48,
      vramTotalGb: 80,
      systemLoadPercent: 62,
      gpuClusterNodes: 12,
      hardwareAccel: 'Triton-Inference',
      gpuType: 'NVIDIA H100 SXM5 80GB'
    },
    parameters: [
      {
        name: 'Sampling Steps',
        key: 'steps',
        type: 'slider',
        min: 10,
        max: 50,
        step: 1,
        defaultValue: 25,
        description: 'Number of denoising diffusion steps.'
      }
    ]
  }
];

export default function App() {
  const [modes, setModes] = useState<GenerativeModeData[]>(MOCK_MODES);
  const [viewMode, setViewMode] = useState<DisplayViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredModes = useMemo(() => {
    return modes.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [modes, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans selection:bg-cyan-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/20 shadow-2xl">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                AI ORCHESTRATION PLATFORM
              </span>
              <span className="text-xs text-slate-400">Cluster Node: <strong className="text-white">US-East-H100</strong></span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-2">
              Thunders Generative Mode Architecture
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live telemetry monitoring, model hyperparameters simulator, and VRAM memory footprint visualizer.
            </p>
          </div>

          {/* View Switcher Controls */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'compact' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Badge
            </button>
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by model name or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'Code Generation', '3D Synthesis', 'Vision & Image'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-cyan-400 border-cyan-500/40'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Render Cards Grid */}
        <div
          className={
            viewMode === 'grid' || viewMode === 'expanded'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredModes.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              viewMode={viewMode}
              onToggleFavorite={(id, fav) => {
                setModes((prev) => prev.map((m) => (m.id === id ? { ...m, isFavorite: fav } : m)));
              }}
              onToggleActive={(id, act) => {
                setModes((prev) => prev.map((m) => (m.id === id ? { ...m, isActive: act } : m)));
              }}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
