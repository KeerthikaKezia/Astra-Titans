import React from 'react';
import {
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Mountain,
  Waves,
  CloudRain,
} from 'lucide-react';
import { TimelineEntry } from '../types';
import { getRiskCategory, getRiskColorClass } from '../services/riskEngine';

interface RiskTimelineProps {
  timeline: TimelineEntry[];
  locationName: string;
}

export const RiskTimeline: React.FC<RiskTimelineProps> = ({
  timeline,
  locationName,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                Temporal Risk Evolution Timeline
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical progression and 24-hour forward hazard forecast trajectory for {locationName}.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400">
              Past (-12h)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="px-2 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
              Current (Now)
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400">
              Forecast (+24h)
            </span>
          </div>
        </div>

        {/* Horizontal Timeline Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 relative">
          {timeline.map((entry, index) => {
            const isCurrent = entry.status === 'current';
            const cat = getRiskCategory(entry.landslideRisk);
            const colors = getRiskColorClass(cat);

            // Calculate trend vs previous entry
            const prevEntry = index > 0 ? timeline[index - 1] : null;
            const diff = prevEntry ? entry.landslideRisk - prevEntry.landslideRisk : 0;

            return (
              <div
                key={index}
                className={`relative rounded-xl p-4 border transition-all ${
                  isCurrent
                    ? 'bg-slate-950 border-cyan-500/80 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header time offset badge */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span
                    className={`text-[11px] font-bold font-mono ${
                      isCurrent ? 'text-cyan-300' : 'text-slate-400'
                    }`}
                  >
                    {entry.label}
                  </span>
                  {isCurrent && (
                    <span className="px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                      Live
                    </span>
                  )}
                </div>

                {/* Score & Category */}
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white font-mono">
                      {entry.landslideRisk}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      / 100
                    </span>
                  </div>

                  <div
                    className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase"
                    style={{
                      backgroundColor: `${colors.fill}15`,
                      color: colors.fill,
                      borderColor: `${colors.fill}35`,
                    }}
                  >
                    {cat.replace('_', ' ')}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${entry.landslideRisk}%`,
                      backgroundColor: colors.fill,
                    }}
                  />
                </div>

                {/* Secondary indicators */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <CloudRain className="w-3 h-3 text-cyan-400" /> Rain:
                    </span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {entry.rainfallMm} mm
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Waves className="w-3 h-3 text-blue-400" /> Flood:
                    </span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {entry.floodRisk}/100
                    </span>
                  </div>

                  {prevEntry && (
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-slate-500">Hazard Shift:</span>
                      {diff > 0 ? (
                        <span className="text-rose-400 flex items-center font-bold">
                          <TrendingUp className="w-3 h-3 mr-0.5" /> +{diff} (Surging)
                        </span>
                      ) : diff < 0 ? (
                        <span className="text-emerald-400 flex items-center font-bold">
                          <TrendingDown className="w-3 h-3 mr-0.5" /> {diff} (Easing)
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center">
                          <Minus className="w-3 h-3 mr-0.5" /> Steady
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
