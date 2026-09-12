import React, { useState } from 'react';
import {
  Mountain,
  CloudRain,
  Droplets,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Compass,
  Sliders,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { LandslideAssessment, LocationData, WeatherData } from '../types';
import { getRiskColorClass } from '../services/riskEngine';

interface LandslideMonitorProps {
  assessment: LandslideAssessment;
  location: LocationData;
  weather: WeatherData;
}

export const LandslideMonitor: React.FC<LandslideMonitorProps> = ({
  assessment,
  location,
  weather,
}) => {
  const [simExtraRain, setSimExtraRain] = useState(0);
  const [simSlopeAdjustment, setSimSlopeAdjustment] = useState(0);

  // Compute what-if simulation adjustments
  const simulatedRain = weather.rainfallLast24hMm + simExtraRain;
  const simulatedSlope = Math.min(65, Math.max(5, location.slopeDegrees + simSlopeAdjustment));
  const simRainFactor = Math.min(100, (simulatedRain / 140) * 100);
  const simSlopeFactor = Math.min(100, (simulatedSlope / 45) * 85);
  const simulatedScore = Math.round(
    Math.min(
      100,
      assessment.score + (simExtraRain * 0.22) + (simSlopeAdjustment * 0.45)
    )
  );

  const colors = getRiskColorClass(assessment.category);

  // SVG Circular gauge calculations
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (assessment.score / 100) * circumference;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-bold tracking-wide uppercase">
              Flagship Geotechnical Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Model v2.4 NER
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Landslide Risk Assessment & Early Warning
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Real-time geomorphological and hydrological slope stability analysis for <strong className="text-white">{location.name}</strong> ({location.state}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Confidence Rating
            </span>
            <span className="text-sm font-black text-cyan-400 font-mono">
              {assessment.confidence}% Precision
            </span>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Slope Gradient
            </span>
            <span className="text-sm font-black text-amber-400 font-mono">
              {location.slopeDegrees}° Angle
            </span>
          </div>
        </div>
      </div>

      {/* Main Row: Big Circular Gauge + Main Drivers + Rainfall Thresholds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Large Circular Gauge Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl backdrop-blur-sm">
          {/* Subtle radial glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: colors.fill }}
          />

          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Current Landslide Hazard Score
          </span>

          {/* SVG Animated Circular Gauge */}
          <div className="relative w-52 h-52 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Background Track */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#1e293b"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Colored Progress Ring */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                stroke={colors.fill}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Central Score Display */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white tracking-tighter">
                {assessment.score}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400 -mt-1">
                out of 100
              </span>
              <div
                className="mt-2 px-3 py-1 rounded-full text-xs font-black tracking-wide border uppercase"
                style={{
                  backgroundColor: `${colors.fill}20`,
                  color: colors.fill,
                  borderColor: `${colors.fill}50`,
                }}
              >
                {assessment.category.replace('_', ' ')} RISK
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-2 px-4 leading-relaxed">
            {assessment.explanation}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800 w-full flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Terrain: {location.terrainType}</span>
            <span>Elevation: {location.elevationMeters}m AMSL</span>
          </div>
        </div>

        {/* Right: Main Drivers & Rainfall Thresholds (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 4 Main Drivers Grid */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Mountain className="w-4 h-4 text-cyan-400" />
              Primary Landslide Drivers for This Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: CloudRain,
                  title: 'Heavy Rainfall',
                  value: `${weather.rainfallLast24hMm.toFixed(1)} mm`,
                  desc: '24h cumulative soil infiltration',
                  status: weather.rainfallLast24hMm > 70 ? 'High Impact' : 'Moderate',
                  color: weather.rainfallLast24hMm > 70 ? 'text-rose-400' : 'text-cyan-400',
                },
                {
                  icon: Mountain,
                  title: 'Steep Terrain',
                  value: `${location.slopeDegrees}° Angle`,
                  desc: `${location.terrainType} slope category`,
                  status: location.slopeDegrees > 35 ? 'Critical Grade' : 'Stable',
                  color: location.slopeDegrees > 35 ? 'text-amber-400' : 'text-slate-300',
                },
                {
                  icon: Droplets,
                  title: 'High Soil Saturation',
                  value: `${weather.soilSaturationPercent}%`,
                  desc: 'Pore water pressure build-up',
                  status: weather.soilSaturationPercent > 75 ? 'Pore Overload' : 'Absorbing',
                  color: weather.soilSaturationPercent > 75 ? 'text-rose-400' : 'text-cyan-400',
                },
                {
                  icon: TrendingUp,
                  title: 'Forecast Precipitation',
                  value: `+${weather.rainfallForecast24hMm.toFixed(0)} mm`,
                  desc: 'Incoming 24h precipitation',
                  status: weather.rainfallForecast24hMm > 50 ? 'Surging Runoff' : 'Tapering',
                  color: weather.rainfallForecast24hMm > 50 ? 'text-orange-400' : 'text-slate-300',
                },
              ].map((driver, idx) => {
                const DIcon = driver.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <DIcon className={`w-4 h-4 ${driver.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-200">
                          {driver.title}
                        </h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {driver.status}
                        </span>
                      </div>
                      <p className="text-base font-extrabold text-white font-mono mt-0.5">
                        {driver.value}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {driver.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rainfall Threshold Monitor */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Rainfall Threshold Monitoring (GSI & IMD Triggers)
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Trigger breach indicator
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  label: 'Last 1 Hour',
                  val: assessment.thresholds.last1h.value,
                  threshold: assessment.thresholds.last1h.threshold,
                  breached: assessment.thresholds.last1h.breached,
                  unit: 'mm/h',
                },
                {
                  label: 'Last 6 Hours',
                  val: assessment.thresholds.last6h.value,
                  threshold: assessment.thresholds.last6h.threshold,
                  breached: assessment.thresholds.last6h.breached,
                  unit: 'mm',
                },
                {
                  label: 'Last 24 Hours',
                  val: assessment.thresholds.last24h.value,
                  threshold: assessment.thresholds.last24h.threshold,
                  breached: assessment.thresholds.last24h.breached,
                  unit: 'mm',
                },
                {
                  label: 'Forecast 24h',
                  val: assessment.thresholds.forecast.value,
                  threshold: assessment.thresholds.forecast.threshold,
                  breached: assessment.thresholds.forecast.breached,
                  unit: 'mm',
                },
              ].map((th, i) => {
                const pct = Math.min(100, Math.round((th.val / th.threshold) * 100));
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border ${
                      th.breached
                        ? 'bg-rose-950/25 border-rose-600/50'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px] font-medium">
                        {th.label}
                      </span>
                      {th.breached ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          TRIGGERED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">
                          Safe
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span
                        className={`text-lg font-black font-mono ${
                          th.breached ? 'text-rose-400' : 'text-white'
                        }`}
                      >
                        {th.val.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-400">{th.unit}</span>
                      <span className="text-[10px] text-slate-500 ml-auto">
                        Limit: {th.threshold}{th.unit}
                      </span>
                    </div>
                    <div className="mt-2 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          th.breached ? 'bg-rose-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Model Explainability: Factor Contribution Breakdown + Equation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Explainable Landslide Scoring Model (Weight & Factor Breakdown)
            </h3>
            <p className="text-xs text-slate-400">
              Normalized mathematical formula combining meteorological telemetry and geotechnical topography.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300">
            Score = Σ (Factor_i × Weight_i)
          </div>
        </div>

        {/* Formula breakdown bar representation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {assessment.factors.map((factor, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  {factor.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900">
                  Weight: {factor.weight}%
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-white font-mono">
                  {factor.score}/100
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    factor.impact === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : factor.impact === 'HIGH'
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {factor.impact}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${factor.score}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {factor.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Why is this risk level? & What should you do? */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Why is this risk level? */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            Why is this risk level {assessment.category.replace('_', ' ')}?
          </h3>
          <ul className="space-y-2.5">
            {assessment.whyPoints.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What should you do? */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Recommended Safety Actions & Civil Directives
          </h3>
          <ul className="space-y-2.5">
            {assessment.recommendedActions.map((action, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-200 leading-relaxed"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interactive Geotechnical What-If Simulation Sandbox */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Scenario Simulator: Geotechnical Sensitivity Stress-Test
            </h3>
            <p className="text-xs text-slate-400">
              Test how sudden rainfall spikes or steeper cut-slopes would impact landslide risk in this terrain.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSimExtraRain(0);
              setSimSlopeAdjustment(0);
            }}
            className="text-xs text-slate-400 hover:text-cyan-300 underline font-medium self-start sm:self-auto cursor-pointer"
          >
            Reset Simulation
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">
                Hypothetical Rainfall Surge:
              </span>
              <span className="text-cyan-400 font-mono font-bold">
                +{simExtraRain} mm (Total: {simulatedRain.toFixed(1)} mm)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={simExtraRain}
              onChange={(e) => setSimExtraRain(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Current</span>
              <span>+50mm Deluge</span>
              <span>+100mm Cloudburst</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">
                Slope Angle Modification:
              </span>
              <span className="text-amber-400 font-mono font-bold">
                {simulatedSlope}° ({simSlopeAdjustment >= 0 ? `+${simSlopeAdjustment}` : simSlopeAdjustment}°)
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="15"
              step="1"
              value={simSlopeAdjustment}
              onChange={(e) => setSimSlopeAdjustment(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>-15° flatter</span>
              <span>Baseline ({location.slopeDegrees}°)</span>
              <span>+15° steeper cut</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Simulated Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  {simulatedScore}/100
                </span>
                <span className="text-xs text-slate-400">
                  ({simulatedScore > assessment.score ? `+${simulatedScore - assessment.score}` : simulatedScore - assessment.score})
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Category</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  simulatedScore > 80
                    ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                    : simulatedScore > 60
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                    : 'bg-amber-950/60 text-amber-300 border-amber-800'
                }`}
              >
                {simulatedScore > 80 ? 'EXTREME' : simulatedScore > 60 ? 'VERY HIGH' : simulatedScore > 40 ? 'HIGH' : 'MODERATE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
