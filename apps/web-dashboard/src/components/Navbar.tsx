import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Menu, 
  X, 
  Sparkles, 
  ChevronDown, 
  Search, 
  BookOpen, 
  Cpu, 
  Terminal, 
  Rocket, 
  ExternalLink,
  Layers,
  Activity,
  Github
} from 'lucide-react';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isGenerativeOpen, setIsGenerativeOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Detect scroll position for dynamic glassmorphism header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation Links Data Structure
  const navItems = [
    { name: 'Home', href: '#home', icon: Zap },
    { name: 'Features', href: '#features', icon: Layers },
    { name: 'AI Models', href: '#models', icon: Cpu },
    { name: 'Docs', href: '#docs', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 px-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 w-full max-w-xl shadow-2xl shadow-cyan-500/10 transition-all">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <Search className="w-5 h-5 text-cyan-400" />
              <input 
                type="text" 
                placeholder="Search models, APIs, docs, or prompt templates..." 
                className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-full text-sm"
                autoFocus
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="pt-3 text-xs text-slate-400 flex justify-between items-center">
              <span>Quick Search for <strong className="text-cyan-400">Thunders Generative AI</strong></span>
              <span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-mono border border-slate-700">ESC to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-slate-900/80 backdrop-blur-xl border-b border-cyan-500/20 shadow-lg shadow-cyan-950/50 py-2' 
            : 'bg-slate-950/60 backdrop-blur-md border-b border-slate-800/80 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            
            <a 
              href="#home" 
              onClick={() => setActiveTab('Home')}
              className="flex items-center space-x-3 group"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                  <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-indigo-300 transition-all">
                  THUNDERS
                </span>
                <span className="text-[9px] font-mono tracking-widest text-cyan-500/80 uppercase -mt-1 font-semibold">
                  GENERATIVE LAB
                </span>
              </div>
            </a>

            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setActiveTab(item.name)}
                    className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 ${
                      isActive 
                        ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 shadow-sm shadow-cyan-500/20' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </a>
                );
              })}

              {/* Generative Interactive Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsGenerativeOpen(!isGenerativeOpen)}
                  onBlur={() => setTimeout(() => setIsGenerativeOpen(false), 200)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 ${
                    isGenerativeOpen 
                      ? 'text-indigo-400 bg-indigo-950/40 border border-indigo-500/30' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Generative Lab</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isGenerativeOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isGenerativeOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl shadow-slate-950/80 overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <a 
                      href="#generative-studio"
                      className="flex items-start space-x-3 px-4 py-2.5 hover:bg-slate-800/80 transition-colors group"
                    >
                      <Terminal className="w-5 h-5 text-cyan-400 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">AI Prompt Studio</div>
                        <div className="text-[11px] text-slate-400">Generate real-time code & models</div>
                      </div>
                    </a>
                    <a 
                      href="#motion-3d"
                      className="flex items-start space-x-3 px-4 py-2.5 hover:bg-slate-800/80 transition-colors group"
                    >
                      <Activity className="w-5 h-5 text-indigo-400 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">3D Motion Engines</div>
                        <div className="text-[11px] text-slate-400">High-speed neural renderers</div>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                title="Search Docs & APIs"
              >
                <Search className="w-4 h-4" />
              </button>

              <a 
                href="#get-started" 
                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-semibold rounded-xl group bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 group-hover:from-cyan-400 group-hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
              >
                <span className="relative px-4 py-1.5 transition-all ease-in duration-75 bg-slate-950 rounded-[10px] group-hover:bg-opacity-0 flex items-center space-x-1.5">
                  <Rocket className="w-4 h-4 text-cyan-400 group-hover:text-white transition-colors" />
                  <span>Get Started</span>
                </span>
              </a>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-cyan-400" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-2xl border-b border-cyan-500/20 px-4 pt-3 pb-6 space-y-3 shadow-2xl transition-all">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    onClick={() => {
                      setActiveTab(item.name);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </a>
                );
              })}
            </div>

            {/* Generative Lab Submenu for Mobile */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="px-3 py-1 text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generative Lab</span>
              </div>
              <a
                href="#generative-studio"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>AI Prompt Studio</span>
              </a>
              <a
                href="#motion-3d"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>3D Motion Engine</span>
              </a>
            </div>

            {/* CTA Button inside Mobile Menu */}
            <div className="pt-3">
              <a
                href="#get-started"
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <Rocket className="w-4 h-4" />
                <span>Get Started Now</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            <span>Thunders Generative v2.4 Engine Active</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Supercharge Your <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Generative Workflows
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            High-speed neural synthesis, real-time code generation, and 3D motion engines engineered for modern development teams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a 
              href="#get-started"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>Explore Playground</span>
              <Rocket className="w-4 h-4" />
            </a>
            <a 
              href="#docs"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold transition-all flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Read Documentation</span>
            </a>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 p-6 rounded-2xl transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ultra-Fast Inference</h3>
            <p className="text-slate-400 text-sm">Low-latency model evaluation running on optimized edge TPU architecture.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 p-6 rounded-2xl transition-all group">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Generative Models</h3>
            <p className="text-slate-400 text-sm">Pre-trained models specialized in code generation, 3D assets, and text reasoning.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 p-6 rounded-2xl transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Terminal className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Developer First SDK</h3>
            <p className="text-slate-400 text-sm">Typescript and Python SDKs ready to deploy with one-line integration.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
