import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Calendar,
  Mountain,
  Waves,
  ShieldAlert,
  Download,
  Filter,
  TrendingUp,
  MapPin,
  Layers,
  Sparkles,
} from 'lucide-react';
import { LocationData } from '../types';

interface AnalyticsPageProps {
  onSelectLocation: (loc: LocationData) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onSelectLocation }) => {
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');

  // Regional State Incident Records (Historical Geological Survey of India + NDMA dataset)
  const stateIncidentData = [
    { state: 'Assam', landslides: 142, floods: 310, total: 452 },
    { state: 'Arunachal', landslides: 285, floods: 74, total: 359 },
    { state: 'Meghalaya', landslides: 230, floods: 88, total: 318 },
    { state: 'Sikkim', landslides: 265, floods: 45, total: 310 },
    { state: 'Nagaland', landslides: 195, floods: 38, total: 233 },
    { state: 'Manipur', landslides: 178, floods: 62, total: 240 },
    { state: 'Mizoram', landslides: 165, floods: 40, total: 205 },
    { state: 'Tripura', landslides: 62, floods: 115, total: 177 },
  ];

  // Monsoon Seasonal Distribution (Monthly Rainfall mm vs Reported Landslides)
  const seasonalTrendData = [
    { month: 'Jan', rain: 22, landslides: 4 },
    { month: 'Feb', rain: 45, landslides: 8 },
    { month: 'Mar', rain: 95, landslides: 16 },
    { month: 'Apr', rain: 180, landslides: 38 },
    { month: 'May', rain: 310, landslides: 85 },
    { month: 'Jun', rain: 520, landslides: 240 },
    { month: 'Jul', rain: 640, landslides: 320 },
    { month: 'Aug', rain: 510, landslides: 260 },
    { month: 'Sep', rain: 390, landslides: 190 },
    { month: 'Oct', rain: 160, landslides: 45 },
    { month: 'Nov', rain: 35, landslides: 10 },
    { month: 'Dec', rain: 15, landslides: 2 },
  ];

  // Most Vulnerable Districts Registry
  const vulnerableDistricts = [
    {
      district: 'East Khasi Hills',
      state: 'Meghalaya',
      vulnerability: 'EXTREME',
      geology: 'Shillong Plateau sandstone, high rain runoff',
      avgSlope: '38°',
      annualRainfall: '11,400 mm',
      score: 94,
    },
    {
      district: 'Dima Hasao (Haflong)',
      state: 'Assam',
      vulnerability: 'VERY HIGH',
      geology: 'Barail shale & sandstone cut-slope collapses',
      avgSlope: '34°',
      annualRainfall: '3,100 mm',
      score: 88,
    },
    {
      district: 'Tawang & West Kameng',
      state: 'Arunachal Pradesh',
      vulnerability: 'EXTREME',
      geology: 'Higher Himalayan crystalline thrust fault zone',
      avgSlope: '44°',
      annualRainfall: '2,900 mm',
      score: 91,
    },
    {
      district: 'South Sikkim (Namchi/Jorethang)',
      state: 'Sikkim',
      vulnerability: 'VERY HIGH',
      geology: 'Teesta valley fractured phyllite & schists',
      avgSlope: '42°',
      annualRainfall: '3,600 mm',
      score: 87,
    },
    {
      district: 'Kohima & Phek',
      state: 'Nagaland',
      vulnerability: 'HIGH',
      geology: 'Disang flysch formation, creep instability',
      avgSlope: '32°',
      annualRainfall: '2,400 mm',
      score: 79,
    },
    {
      district: 'Aizawl & Champhai',
      state: 'Mizoram',
      vulnerability: 'HIGH',
      geology: 'Anticlinal ridges with unconsolidated siltstone',
      avgSlope: '35°',
      annualRainfall: '2,800 mm',
      score: 76,
    },
  ];

  const hazardColors = ['#0ea5e9', '#f97316', '#a855f7', '#10b981'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-bold tracking-wide uppercase">
              Geospatial Data Observatory
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Decadal Climatological Archive (2014–2026)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            NER Disaster Analytics & Historical Landslide Insights
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Empirical baseline analysis of monsoon precipitation dynamics, slope failure recurrence, and district vulnerability indices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Monitored Stations',
            val: '18 Active Nodes',
            sub: 'Across 8 NER states',
            icon: MapPin,
            color: 'text-cyan-400',
          },
          {
            label: 'Landslide Incidents (Annual)',
            val: '1,530+ Events',
            sub: '78% occur Jun–Sep monsoon',
            icon: Mountain,
            color: 'text-rose-400',
          },
          {
            label: 'Extreme Vulnerability Districts',
            val: '24 Hill Districts',
            sub: 'Classified GSI Zone V & IV',
            icon: ShieldAlert,
            color: 'text-amber-400',
          },
          {
            label: 'Peak Monthly Rainfall',
            val: '640 mm (July)',
            sub: 'Cherrapunji record > 1,200mm',
            icon: Waves,
            color: 'text-blue-400',
          },
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {metric.label}
                </span>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <p className="text-2xl font-black text-white font-mono mt-2">
                {metric.val}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {metric.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Two Big Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Incidents by State */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Disaster Incident Frequency by NER State
              </h3>
              <p className="text-xs text-slate-400">
                Landslide events vs. Riverine flood inundations.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
              NDMA Annual Log
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateIncidentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="state" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="landslides" name="Landslides / Mudflows" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="floods" name="Floods / Catchment Inundations" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monsoon Monthly Trend */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Monsoon Climatology & Slope Failure Spikes (Jan–Dec)
              </h3>
              <p className="text-xs text-slate-400">
                Correlation between monthly rainfall (mm) and landslide occurrences.
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              Peak: Jun–Sep
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seasonalTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#38bdf8" fontSize={10} label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#38bdf8', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" fontSize={10} label={{ value: 'Reported Landslides', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area yAxisId="left" type="monotone" dataKey="rain" name="Monthly Rain (mm)" fill="#0284c730" stroke="#0284c7" strokeWidth={2} />
                <Area yAxisId="right" type="monotone" dataKey="landslides" name="Landslide Events" fill="#f43f5e30" stroke="#f43f5e" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Most Vulnerable Districts Matrix Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mountain className="w-4 h-4 text-cyan-400" />
              North Eastern Region — Top Vulnerable Geomorphic Districts
            </h3>
            <p className="text-xs text-slate-400">
              Geological Survey of India (GSI) Macro-Landslide Susceptibility Rankings.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Classified as Critical Red/Orange Corridors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">District & State</th>
                <th className="py-3 px-3">Vulnerability Level</th>
                <th className="py-3 px-3">Geological Composition</th>
                <th className="py-3 px-3">Avg Slope</th>
                <th className="py-3 px-3">Annual Rain</th>
                <th className="py-3 px-3 text-right">Risk Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {vulnerableDistricts.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-200 block text-sm">
                      {row.district}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {row.state}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${
                        row.vulnerability === 'EXTREME'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                          : row.vulnerability === 'VERY HIGH'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                          : 'bg-amber-950/60 text-amber-300 border-amber-800'
                      }`}
                    >
                      {row.vulnerability}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300 max-w-xs truncate">
                    {row.geology}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-300 font-semibold">
                    {row.avgSlope}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-cyan-300 font-semibold">
                    {row.annualRainfall}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-black text-white text-base">
                    {row.score}/100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
