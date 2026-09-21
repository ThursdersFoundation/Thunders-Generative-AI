import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  LayoutDashboard,
  Cpu,
  Layers,
  Activity,
  Key,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Terminal,
  Database,
  GitBranch,
  Sliders,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LogOut,
  ChevronDown,
  Plus,
  Shield,
  Server,
  Code
} from 'lucide-react';

/**
 * ============================================================================
 * ARCHITECTURAL CONCEPT & REKAYASA SISTEM (System Engineering Overview)
 * ============================================================================
 * 1. STATE MANAGEMENT:
 *    - Uses localized state with persistent state potential (e.g. localStorage).
 *    - Collapsed vs Expanded viewport transitions engineered via Tailwind CSS flex/grid.
 * 2. SEARCH & FILTERING ENGINE:
 *    - Fuzzy-search array filtering over navigation nodes for instant menu navigation.
 * 3. TELEMETRY & SYSTEM MONITORING (Rangkaian Sensor System):
 *    - Real-time simulation of engine latency, GPU memory utilization, and API health.
 * 4. ACCESSIBILITY & TOOLTIPS:
 *    - Conditional renders tooltips when sidebar is collapsed to maintain UX clarity.
 * ============================================================================
 */

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  href: string;
  category: 'core' | 'generative' | 'engineering' | 'management';
}

export interface Workspace {
  id: string;
  name: string;
  plan: string;
  avatar: string;
}

export default function App() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeItemId, setActiveItemId] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState<boolean>(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace>({
    id: 'ws-1',
    name: 'Thunders AI Lab',
    plan: 'Enterprise Neural',
    avatar: '⚡'
  });

  // Simulated live telemetry metrics
  const [gpuLoad, setGpuLoad] = useState<number>(42);
  const [latency, setLatency] = useState<number>(18);

  useEffect(() => {
    const interval = setInterval(() => {
      setGpuLoad(Math.floor(35 + Math.random() * 25));
      setLatency(Math.floor(14 + Math.random() * 8));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '#dashboard', category: 'core' },
    { id: 'prompt-studio', label: 'AI Prompt Studio', icon: Terminal, badge: 'v2.4', badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', href: '#studio', category: 'generative' },
    { id: 'models', label: 'Neural Models', icon: Cpu, badge: '12 Active', badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', href: '#models', category: 'generative' },
    { id: 'motion-3d', label: '3D Motion Synthesis', icon: Sparkles, href: '#3d-motion', category: 'generative' },
    { id: 'pipelines', label: 'Gen-AI Pipelines', icon: GitBranch, href: '#pipelines', category: 'engineering' },
    { id: 'vector-db', label: 'Vector Store (RAG)', icon: Database, href: '#vectordb', category: 'engineering' },
    { id: 'compute', label: 'GPU Compute Clusters', icon: Server, href: '#compute', category: 'engineering' },
    { id: 'analytics', label: 'Model Performance', icon: BarChart2, href: '#analytics', category: 'management' },
    { id: 'api-keys', label: 'API Keys & Secrets', icon: Key, href: '#apikeys', category: 'management' },
    { id: 'settings', label: 'Engine Settings', icon: Settings, href: '#settings', category: 'management' }
  ];

  const filteredNavItems = useMemo(() => {
    if (!searchQuery.trim()) return navItems;
    return navItems.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const categorizedItems = {
    core: filteredNavItems.filter(i => i.category === 'core'),
    generative: filteredNavItems.filter(i => i.category === 'generative'),
    engineering: filteredNavItems.filter(i => i.category === 'engineering'),
    management: filteredNavItems.filter(i => i.category === 'management')
  };

  const workspaces: Workspace[] = [
    { id: 'ws-1', name: 'Thunders AI Lab', plan: 'Enterprise Neural', avatar: '⚡' },
    { id: 'ws-2', name: 'Generative Production', plan: 'Scale Tier', avatar: '🚀' },
    { id: 'ws-3', name: 'R&D Sandbox', plan: 'Developer Pro', avatar: '🧪' }
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      
      {/* ======================================================================== */}
      {/* REKAYASA SIDEBAR COMPONENT CONTAINER                                   */}
      {/* ======================================================================== */}
      <aside 
        className={`relative flex flex-col h-full bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/80 transition-all duration-300 ease-in-out z-30 select-none ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        
        {}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
              </div>
            </div>
            
            {!isCollapsed && (
              <div className="flex flex-col truncate transition-opacity duration-200">
                <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                  THUNDERS
                </span>
                <span className="text-[9px] font-mono tracking-widest text-cyan-500/80 uppercase font-semibold -mt-1">
                  GENERATIVE AI
                </span>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors focus:outline-none"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {}
        <div className="px-3 py-3 border-b border-slate-800/50">
          <div className="relative">
            <button
              onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
              className={`w-full flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/30 transition-all ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <span className="text-lg leading-none">{selectedWorkspace.avatar}</span>
                {!isCollapsed && (
                  <div className="text-left truncate">
                    <p className="text-xs font-bold text-slate-200 truncate">{selectedWorkspace.name}</p>
                    <p className="text-[10px] text-cyan-400/80 font-mono">{selectedWorkspace.plan}</p>
                  </div>
                )}
              </div>
              {!isCollapsed && <ChevronDown className="w-4 h-4 text-slate-400 ml-1 flex-shrink-0" />}
            </button>

            {/* Workspace Dropdown Panel */}
            {isWorkspaceOpen && !isCollapsed && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50">
                <div className="text-[10px] font-mono text-slate-500 px-2 py-1 uppercase font-semibold">Switch Workspace</div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setSelectedWorkspace(ws);
                      setIsWorkspaceOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-2 py-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                  >
                    <span>{ws.avatar}</span>
                    <div className="truncate">
                      <p className="text-xs font-medium text-slate-200">{ws.name}</p>
                      <p className="text-[10px] text-slate-400">{ws.plan}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {}
        {!isCollapsed && (
          <div className="px-3 pt-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tools & models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 text-xs text-slate-200 placeholder-slate-500 rounded-lg pl-8 pr-3 py-2 border border-slate-800 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>
        )}

        {}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Quick Action Button */}
          {!isCollapsed && (
            <button className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all">
              <Plus className="w-4 h-4" />
              <span>New Pipeline</span>
            </button>
          )}

          {/* Section: Core Navigation */}
          <div>
            {categorizedItems.core.map(item => (
              <SidebarNavItem 
                key={item.id} 
                item={item} 
                isCollapsed={isCollapsed} 
                isActive={activeItemId === item.id} 
                onClick={() => setActiveItemId(item.id)} 
              />
            ))}
          </div>

          {/* Section: Generative Tools */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
                Generative Engines
              </div>
            )}
            {categorizedItems.generative.map(item => (
              <SidebarNavItem 
                key={item.id} 
                item={item} 
                isCollapsed={isCollapsed} 
                isActive={activeItemId === item.id} 
                onClick={() => setActiveItemId(item.id)} 
              />
            ))}
          </div>

          {/* Section: System & Engineering */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
                Engineering & Infra
              </div>
            )}
            {categorizedItems.engineering.map(item => (
              <SidebarNavItem 
                key={item.id} 
                item={item} 
                isCollapsed={isCollapsed} 
                isActive={activeItemId === item.id} 
                onClick={() => setActiveItemId(item.id)} 
              />
            ))}
          </div>

          {/* Section: Management & Analytics */}
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
                System & API
              </div>
            )}
            {categorizedItems.management.map(item => (
              <SidebarNavItem 
                key={item.id} 
                item={item} 
                isCollapsed={isCollapsed} 
                isActive={activeItemId === item.id} 
                onClick={() => setActiveItemId(item.id)} 
              />
            ))}
          </div>

        </div>

        {}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          {!isCollapsed ? (
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-2" />
                  Cluster Optimal
                </span>
                <span className="text-slate-500 font-mono">{latency}ms</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>GPU Cluster Load</span>
                  <span>{gpuLoad}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-500" 
                    style={{ width: `${gpuLoad}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="System Status: Optimal">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
          )}
        </div>

        {}
        <div className="p-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 p-[1px] flex-shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[7px] flex items-center justify-center text-xs font-bold text-cyan-400">
                AI
              </div>
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">System Engineer</p>
                <p className="text-[10px] text-slate-500 truncate">eng@thunders.ai</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

      </aside>

      {}
      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950 p-8">
        <div className="max-w-5xl mx-auto w-full space-y-6">
          
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-cyan-500/20 shadow-xl">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  SYSTEM ACTIVE
                </span>
                <span className="text-xs text-slate-400">Section: <strong className="text-white capitalize">{activeItemId}</strong></span>
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-2">
                Thunders Generative Control Center
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Real-time architectural navigation, GPU load telemetry, and AI pipeline orchestration.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-all flex items-center space-x-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>API Endpoint</span>
              </button>
            </div>
          </div>

          {/* System Engineering Architecture Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                <Shield className="w-4 h-4" />
                <span>Rangkaian & Technical Architecture</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The sidebar leverages a responsive state-machine pattern. Node selection emits signal events across the AI pipeline framework while tracking cluster load.
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 font-mono bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>React Hooks (useMemo, useState, useEffect)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TypeScript Strict Interfaces</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tailwind Responsive Grid & Glassmorphism</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                <Activity className="w-4 h-4" />
                <span>Live Cluster Telemetry</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Engine Latency:</span>
                  <span className="font-mono text-cyan-400">{latency} ms</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>GPU Cluster Utilization:</span>
                  <span className="font-mono text-indigo-400">{gpuLoad}%</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Active Workspace:</span>
                  <span className="font-mono text-emerald-400">{selectedWorkspace.name}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}

interface SidebarNavItemProps {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ item, isCollapsed, isActive, onClick }) => {
  const Icon = item.icon;

  return (
    <a
      href={item.href}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`group relative flex items-center px-3 py-2.5 my-0.5 rounded-xl text-xs font-medium transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/40 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-950/50'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      } ${isCollapsed ? 'justify-center' : ''}`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
      }`} />

      {!isCollapsed && (
        <span className="ml-3 truncate flex-1">{item.label}</span>
      )}

      {!isCollapsed && item.badge && (
        <span className={`ml-auto px-1.5 py-0.5 text-[9px] font-mono rounded-md border ${item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
          {item.badge}
        </span>
      )}

      {/* Hover Tooltip when collapsed */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-slate-200 text-xs font-medium rounded-lg shadow-xl border border-slate-800 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
          {item.label}
        </div>
      )}
    </a>
  );
};
