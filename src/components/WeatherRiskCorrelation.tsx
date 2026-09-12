import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
} from 'recharts';
import {
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Calendar,
  CloudLightning,
} from 'lucide-react';
import { WeatherData, LocationData, LandslideAssessment } from '../types';

interface WeatherRiskCorrelationProps {
  weather: WeatherData;
  location: LocationData;
  landslideAssessment: LandslideAssessment;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  isLive: boolean;
  dataSource: string;
}

export const WeatherRiskCorrelation: React.FC<WeatherRiskCorrelationProps> = ({
  weather,
  location,
  landslideAssessment,
  onAnalyze,
  isAnalyzing,
  isLive,
  dataSource,
}) => {
  // Synthesize correlation dataset showing Rainfall vs Landslide Risk escalation curve
  const correlationData = [
    { rain: 10, risk: 22, label: '10mm (Light)' },
    { rain: 30, risk: 36, label: '30mm (Moderate)' },
    { rain: 60, risk: 54, label: '60mm (Heavy)' },
    { rain: 90, risk: 71, label: '90mm (Very Heavy)' },
    { rain: 130, risk: 88, label: '130mm (Extremely Heavy)' },
    { rain: 170, risk: 96, label: '170mm (Catastrophic)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-bold tracking-wide uppercase">
              Meteorological Telemetry
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Station: {location.name}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Weather Conditions & Disaster Risk Correlation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Real-time atmospheric monitoring, precipitation curves, and hydrological correlation modeling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
              Data Source
            </span>
            <span className="text-xs font-semibold text-cyan-400">
              {dataSource}
            </span>
          </div>
          <button
            type="button"
            id="btn-weather-analyze"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Recalculating...' : 'Analyze Conditions'}</span>
          </button>
        </div>
      </div>

      {/* Weather Telemetry Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            icon: Thermometer,
            label: 'Temperature',
            val: `${weather.temperatureC}°C`,
            sub: weather.condition,
            color: 'text-amber-400',
          },
          {
            icon: CloudRain,
            label: '24h Rainfall',
            val: `${weather.rainfallLast24hMm.toFixed(1)} mm`,
            sub: `1h: ${weather.rainfallLast1hMm}mm • 6h: ${weather.rainfallLast6hMm}mm`,
            color: 'text-cyan-400',
          },
          {
            icon: Droplets,
            label: 'Humidity',
            val: `${weather.humidityPercent}%`,
            sub: 'Relative moisture',
            color: 'text-blue-400',
          },
          {
            icon: Wind,
            label: 'Wind Speed',
            val: `${weather.windSpeedKmh} km/h`,
            sub: 'Sustained surface gusts',
            color: 'text-emerald-400',
          },
          {
            icon: Gauge,
            label: 'Barometer',
            val: `${weather.pressureHpa} hPa`,
            sub: weather.pressureHpa < 1000 ? 'Low pressure depression' : 'Normal',
            color: 'text-purple-400',
          },
          {
            icon: CloudLightning,
            label: '24h Rain Forecast',
            val: `${weather.rainfallForecast24hMm.toFixed(1)} mm`,
            sub: 'Expected next 24h',
            color: 'text-rose-400',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                  {item.label}
                </span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <p className="text-xl font-black text-white font-mono">
                {item.val}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {item.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Two Main Charts Row: Hourly Precipitation & Rainfall vs Landslide Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Rainfall Over Time & Forecast */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                Rainfall Telemetry & Risk Score Over Time
              </h3>
              <p className="text-xs text-slate-400">
                Precipitation (mm) and correlated risk index over 24-hour window.
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              Hourly Telemetry
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weather.hourlyForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#38bdf8" fontSize={11} label={{ value: 'Rain (mm)', angle: -90, position: 'insideLeft', fill: '#38bdf8', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#f43f5e" fontSize={11} label={{ value: 'Risk Index', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 10 }} />
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
                <Bar yAxisId="left" dataKey="rainfallMm" name="Rainfall (mm)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="estimatedRisk" name="Hazard Risk Index" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Rainfall vs Landslide Risk Correlation Curve */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-400" />
                Rainfall vs. Landslide Risk Correlation
              </h3>
              <p className="text-xs text-slate-400">
                Demonstrates how increasing rainfall load triggers critical pore water pressure spikes on slope.
              </p>
            </div>
            <span className="text-[10px] font-mono text-rose-400 px-2 py-0.5 rounded bg-rose-950 border border-rose-800">
              GSI Slope Model
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#f97316" fontSize={11} label={{ value: 'Landslide Score (0-100)', angle: -90, position: 'insideLeft', fill: '#f97316', fontSize: 10 }} />
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
                <Area type="monotone" dataKey="risk" name="Estimated Landslide Risk" fill="#f9731630" stroke="#f97316" strokeWidth={3} />
                <Bar dataKey="rain" name="Rainfall Threshold (mm)" fill="#06b6d4" opacity={0.6} radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 7-Day Extended Forecast Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            7-Day Regional Weather Outlook & Anticipated Risk
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {location.district} Basin Forecast
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {weather.dailyForecast.map((day, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-1"
            >
              <p className="text-xs font-bold text-slate-300">{day.day}</p>
              <div className="my-1 text-cyan-400 flex justify-center">
                <CloudRain className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-white font-mono">
                {day.rainfallMm.toFixed(0)} mm
              </p>
              <p className="text-[11px] text-slate-400">
                {day.maxTempC}° / {day.minTempC}°
              </p>
              <span
                className={`inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded mt-1 border uppercase ${
                  day.riskCategory === 'EXTREME'
                    ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                    : day.riskCategory === 'VERY_HIGH'
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                    : day.riskCategory === 'HIGH'
                    ? 'bg-orange-950/60 text-orange-300 border-orange-800'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                }`}
              >
                {day.riskCategory.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
