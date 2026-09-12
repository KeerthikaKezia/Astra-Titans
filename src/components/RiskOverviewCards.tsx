import React from 'react';
import {
  Mountain,
  Waves,
  CloudLightning,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { DisasterPredictionResult, RiskCategory } from '../types';
import { getRiskColorClass } from '../services/riskEngine';

interface RiskOverviewCardsProps {
  prediction: DisasterPredictionResult;
  onSelectHazard: (hazardType: string) => void;
}

export const RiskOverviewCards: React.FC<RiskOverviewCardsProps> = ({
  prediction,
  onSelectHazard,
}) => {
  const { landslideRisk, floodRisk, heavyRainfallRisk, overallRisk } = prediction;

  const cards = [
    {
      id: 'landslide',
      title: 'Landslide Risk',
      hazardKey: 'Landslide',
      score: landslideRisk.score,
      category: landslideRisk.category,
      subtitle: `${prediction.location.slopeDegrees}° terrain slope • ${prediction.weather.soilSaturationPercent}% soil moisture`,
      icon: Mountain,
      isFlagship: true,
      trend: landslideRisk.score > 60 ? 'Surging' : 'Stable',
    },
    {
      id: 'flood',
      title: 'Flood Risk',
      hazardKey: 'Flood',
      score: floodRisk.score,
      category: floodRisk.category,
      subtitle: `${prediction.location.elevationMeters}m elevation • ${prediction.location.nearbyRivers?.[0] || 'Catchment Basin'}`,
      icon: Waves,
      isFlagship: false,
      trend: floodRisk.score > 50 ? 'Rising' : 'Normal',
    },
    {
      id: 'heavy-rain',
      title: 'Heavy Rainfall Risk',
      hazardKey: 'Heavy Rainfall',
      score: heavyRainfallRisk.score,
      category: heavyRainfallRisk.category,
      subtitle: `24h sum: ${prediction.weather.rainfallLast24hMm.toFixed(0)}mm • ${prediction.weather.rainfallForecast24hMm.toFixed(0)}mm forecast`,
      icon: CloudLightning,
      isFlagship: false,
      trend: prediction.weather.rainfallForecast24hMm > 50 ? 'Incoming' : 'Moderate',
    },
    {
      id: 'overall',
      title: 'Overall Disaster Risk',
      hazardKey: 'Overall',
      score: overallRisk.score,
      category: overallRisk.category,
      subtitle: `Multi-hazard convergence • ${overallRisk.confidence}% Model Confidence`,
      icon: ShieldAlert,
      isFlagship: false,
      trend: overallRisk.score > 60 ? 'High Alert' : 'Monitored',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Real-Time Risk Assessment
          </span>
          {prediction.isAiGenerated && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
              <Sparkles className="w-2.5 h-2.5" /> AI Evaluated
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Updated: {new Date(prediction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const colors = getRiskColorClass(card.category);
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              id={`risk-card-${card.id}`}
              onClick={() => onSelectHazard(card.hazardKey)}
              className={`relative overflow-hidden rounded-2xl bg-slate-900/90 border p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer group backdrop-blur-sm ${
                card.isFlagship
                  ? 'border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Subtle top indicator bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: colors.fill }}
              />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border"
                    style={{
                      backgroundColor: `${colors.fill}15`,
                      borderColor: `${colors.fill}35`,
                      color: colors.fill,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                      {card.title}
                      {card.isFlagship && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
                          FLAGSHIP
                        </span>
                      )}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black text-white tracking-tight">
                        {card.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {card.score}/100
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="p-1 rounded-lg text-slate-500 group-hover:text-cyan-400 group-hover:bg-slate-800 transition-colors"
                  title="View hazard breakdown"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* Progress meter bar */}
              <div className="mt-4">
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${card.score}%`,
                      backgroundColor: colors.fill,
                    }}
                  />
                </div>
              </div>

              {/* Subtitle & Trend */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                  {card.subtitle}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                  <TrendingUp className="w-3 h-3 text-cyan-400" />
                  {card.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
