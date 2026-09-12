import React from 'react';
import {
  ShieldAlert,
  Radio,
  MapPin,
  CloudRain,
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Info,
  Layers,
  Sparkles,
  PhoneCall,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  alertCount: number;
  onQuickCheck: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDemoMode,
  setIsDemoMode,
  alertCount,
  onQuickCheck,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      {/* Top advisory banner */}
      <div className="bg-amber-950/60 border-b border-amber-600/30 px-4 py-1 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="font-medium">
          PROTOTYPE DECISION-SUPPORT SYSTEM:
        </span>
        <span className="text-amber-200/90 hidden sm:inline">
          Estimates are for early planning & research. Always follow official NDMA, IMD & State Disaster Management Authority (SDMA) bulletins.
        </span>
        {isDemoMode && (
          <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] uppercase font-bold tracking-wider">
            Demo Data Active
          </span>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div
            id="nav-brand-logo"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-800 p-0.5 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  NER DisasterGuard
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                  <Sparkles className="w-2.5 h-2.5" /> AI Risk Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                North Eastern Region • Early Warning & Landslide Monitor
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'risk-map', label: 'Risk Map', icon: MapPin },
              { id: 'landslide', label: 'Landslide Monitor', icon: Layers },
              { id: 'weather', label: 'Weather', icon: CloudRain },
              { id: 'alerts', label: 'Alerts', icon: Radio, count: alertCount },
              { id: 'states', label: 'NER States', icon: Layers },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'emergency', label: 'Safety & Helplines', icon: PhoneCall },
              { id: 'about', label: 'About', icon: Info },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {Boolean(item.count && item.count > 0) && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Mode Toggle & Quick CTA */}
          <div className="flex items-center gap-3">
            {/* Demo / Live Mode Toggle */}
            <div
              id="mode-toggle-container"
              className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1 text-xs"
            >
              <button
                type="button"
                id="btn-mode-demo"
                onClick={() => setIsDemoMode(true)}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  isDemoMode
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Use realistic simulated meteorological & terrain data for NER"
              >
                Demo
              </button>
              <button
                type="button"
                id="btn-mode-live"
                onClick={() => setIsDemoMode(false)}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  !isDemoMode
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Connect to live open meteorological APIs and server AI"
              >
                Live
              </button>
            </div>

            {/* Quick Check CTA */}
            <button
              type="button"
              id="btn-quick-check-header"
              onClick={onQuickCheck}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/50 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Check My Location</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Scroll */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-900 scrollbar-none">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'risk-map', label: 'Risk Map' },
            { id: 'landslide', label: 'Landslide' },
            { id: 'weather', label: 'Weather' },
            { id: 'alerts', label: `Alerts (${alertCount})` },
            { id: 'states', label: 'States' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'emergency', label: 'Safety' },
            { id: 'about', label: 'About' },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
