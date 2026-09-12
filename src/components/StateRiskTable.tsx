import React from 'react';
import {
  Layers,
  MapPin,
  AlertTriangle,
  CloudRain,
  Mountain,
  Waves,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { NER_STATES_DATA, NER_LOCATIONS } from '../data/nerStates';
import { NERStateData, LocationData } from '../types';
import { getRiskColorClass } from '../services/riskEngine';

interface StateRiskTableProps {
  onSelectLocation: (loc: LocationData) => void;
}

export const StateRiskTable: React.FC<StateRiskTableProps> = ({ onSelectLocation }) => {
  const handleSelectStateCapital = (stateName: string) => {
    const loc = NER_LOCATIONS.find((l) => l.state === stateName) || NER_LOCATIONS[0];
    onSelectLocation(loc);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-bold tracking-wide uppercase">
              Inter-State Regional Grid
            </span>
            <span className="text-xs text-slate-400 font-mono">
              8 States of North Eastern India
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            NER State-Wise Disaster Risk Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Comparative analysis of landslide susceptibility, river basin inundation, and active meteorological alerts across the North Eastern Council (NEC) region.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 self-start sm:self-auto">
          Synchronized with SDMA State Control Rooms
        </div>
      </div>

      {/* Grid of 8 States */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {NER_STATES_DATA.map((stateData) => {
          const overallColor = getRiskColorClass(stateData.overallRisk);
          const landslideColor = getRiskColorClass(stateData.landslideRisk);
          const floodColor = getRiskColorClass(stateData.floodRisk);

          return (
            <div
              key={stateData.state}
              id={`state-card-${stateData.state.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-slate-900/95 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group backdrop-blur-sm"
            >
              <div>
                {/* State Title & Capital */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                      {stateData.state}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Cap: {stateData.capital}
                    </p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-black border uppercase"
                    style={{
                      backgroundColor: `${overallColor.fill}20`,
                      color: overallColor.fill,
                      borderColor: `${overallColor.fill}40`,
                    }}
                  >
                    {stateData.overallRisk.replace('_', ' ')}
                  </span>
                </div>

                {/* Risk Parameters Breakdown */}
                <div className="space-y-2 mt-4 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Mountain className="w-3.5 h-3.5 text-cyan-400" />
                      Landslide
                    </span>
                    <span
                      className="font-bold text-[11px]"
                      style={{ color: landslideColor.fill }}
                    >
                      {stateData.landslideRisk.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Waves className="w-3.5 h-3.5 text-blue-400" />
                      Flood
                    </span>
                    <span
                      className="font-bold text-[11px]"
                      style={{ color: floodColor.fill }}
                    >
                      {stateData.floodRisk.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <CloudRain className="w-3.5 h-3.5 text-indigo-400" />
                      24h Avg Rain
                    </span>
                    <span className="font-bold text-slate-200 font-mono">
                      {stateData.avgRainfall24hMm} mm
                    </span>
                  </div>
                </div>

                {/* High-risk districts & vulnerabilities */}
                <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p>
                    <strong className="text-slate-300">Hotspots: </strong>
                    {stateData.highRiskDistricts.slice(0, 2).join(', ')}
                  </p>
                  <p className="line-clamp-2 text-slate-500">
                    {stateData.keyVulnerabilities}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {stateData.activeAlertsCount} Active Warnings
                </span>

                <button
                  type="button"
                  onClick={() => handleSelectStateCapital(stateData.state)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span>Inspect</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
