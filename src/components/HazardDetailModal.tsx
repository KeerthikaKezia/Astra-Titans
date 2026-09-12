import React from 'react';
import {
  X,
  Mountain,
  Waves,
  CloudLightning,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Gauge,
  Info,
} from 'lucide-react';
import { DisasterPredictionResult, EarlyWarningAlert } from '../types';
import { getRiskColorClass } from '../services/riskEngine';

interface HazardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  hazardType: string | null;
  prediction: DisasterPredictionResult;
  selectedAlert?: EarlyWarningAlert | null;
}

export const HazardDetailModal: React.FC<HazardDetailModalProps> = ({
  isOpen,
  onClose,
  hazardType,
  prediction,
  selectedAlert,
}) => {
  if (!isOpen) return null;

  // Determine hazard data
  let title = 'Multi-Hazard Risk Assessment';
  let score = prediction.overallRisk.score;
  let category = prediction.overallRisk.category;
  let confidence = prediction.overallRisk.confidence;
  let Icon = ShieldAlert;
  let description = prediction.overallRisk.explanation;
  let drivers = [
    `Terrain slope gradient: ${prediction.location.slopeDegrees}°`,
    `24-hour cumulative rainfall: ${prediction.weather.rainfallLast24hMm.toFixed(1)} mm`,
    `Soil moisture saturation: ${prediction.weather.soilSaturationPercent}%`,
    `Elevation: ${prediction.location.elevationMeters}m above mean sea level`,
  ];
  let safetyActions = prediction.landslideRisk.recommendedActions;

  if (hazardType === 'Landslide') {
    title = 'Landslide & Slope Instability Risk';
    score = prediction.landslideRisk.score;
    category = prediction.landslideRisk.category;
    confidence = prediction.landslideRisk.confidence;
    Icon = Mountain;
    description = prediction.landslideRisk.explanation;
    drivers = prediction.landslideRisk.whyPoints;
    safetyActions = prediction.landslideRisk.recommendedActions;
  } else if (hazardType === 'Flood') {
    title = 'Riverine & Flash Flood Hazard';
    score = prediction.floodRisk.score;
    category = prediction.floodRisk.category;
    confidence = prediction.floodRisk.confidence;
    Icon = Waves;
    description = prediction.floodRisk.explanation;
    drivers = [
      `Catchment drainage basin: ${prediction.location.nearbyRivers?.join(', ') || 'Valley tributaries'}`,
      `Surface elevation: ${prediction.location.elevationMeters}m AMSL`,
      `Forecast precipitation load: +${prediction.weather.rainfallForecast24hMm.toFixed(0)} mm`,
      `Brahmaputra/Barak basin hydrological warning status: Active`,
    ];
    safetyActions = [
      'Avoid driving or walking through flowing flood water or submerged bridges.',
      'Move livestock and portable machinery to designated highland relief platforms.',
      'Drink only boiled or chemically chlorinated water to avoid waterborne cholera/gastroenteritis.',
      'Turn off main circuit breakers if floodwaters enter the residence.',
    ];
  } else if (hazardType === 'Heavy Rainfall') {
    title = 'Severe Meteorological Precipitation';
    score = prediction.heavyRainfallRisk.score;
    category = prediction.heavyRainfallRisk.category;
    confidence = prediction.heavyRainfallRisk.confidence;
    Icon = CloudLightning;
    description = prediction.heavyRainfallRisk.explanation;
    drivers = [
      `Precipitation last 24h: ${prediction.weather.rainfallLast24hMm.toFixed(1)} mm`,
      `Precipitation last 1h peak: ${prediction.weather.rainfallLast1hMm.toFixed(1)} mm/h`,
      `Atmospheric pressure: ${prediction.weather.pressureHpa} hPa`,
      `Relative humidity: ${prediction.weather.humidityPercent}%`,
    ];
    safetyActions = [
      'Postpone non-essential travel along mountain highways (NH-29, NH-10, NH-27).',
      'Watch out for lightning strikes; stay inside sturdy non-metal structures.',
      'Check culverts and property drainage to ensure runoff does not pool against building foundations.',
    ];
  }

  // If opened via alert
  if (selectedAlert) {
    title = `${selectedAlert.hazard} Emergency Advisory`;
    category = selectedAlert.severity;
    description = selectedAlert.reason;
    safetyActions = [selectedAlert.recommendedAction];
  }

  const colors = getRiskColorClass(category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="hazard-detail-modal"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Top Header with color stripe */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: colors.fill }}
        />

        <div className="p-5 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: `${colors.fill}20`,
                borderColor: `${colors.fill}40`,
                color: colors.fill,
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Hazard Forensic Dossier
              </span>
              <h3 className="text-lg font-bold text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-400">
                {prediction.location.name} • {prediction.location.district}, {prediction.location.state}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Risk Score & Confidence Row */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Estimated Score
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-white font-mono">
                  {score}
                </span>
                <span className="text-xs text-slate-500 font-mono">/ 100</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Severity Level
              </span>
              <span
                className="inline-block text-xs font-black px-2 py-0.5 rounded mt-1 border uppercase"
                style={{
                  backgroundColor: `${colors.fill}20`,
                  color: colors.fill,
                  borderColor: `${colors.fill}40`,
                }}
              >
                {category.replace('_', ' ')}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Model Confidence
              </span>
              <span className="text-base font-extrabold text-cyan-400 font-mono block mt-1">
                {confidence}% Precision
              </span>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Technical Assessment
            </h4>
            <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Key Drivers / Why points */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Primary Risk Drivers & Geomorphological Triggers
            </h4>
            <ul className="space-y-2">
              {drivers.map((driver, i) => (
                <li
                  key={i}
                  className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Safety Actions */}
          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              Recommended Civil Actions
            </h4>
            <ul className="space-y-2">
              {safetyActions.map((action, i) => (
                <li
                  key={i}
                  className="text-xs text-emerald-200 flex items-start gap-2 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-800/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Context footnote */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-400">Decision Support Prototype: </span>
            This calculation combines GSI macro-zonation baseline heuristics with IMD-calibrated precipitation thresholds. It does not supersede statutory evacuation orders issued by District Disaster Management Authorities (DDMA).
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
