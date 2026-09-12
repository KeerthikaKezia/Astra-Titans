import React, { useState } from 'react';
import {
  AlertTriangle,
  Radio,
  CheckCircle2,
  Share2,
  ExternalLink,
  Filter,
  Volume2,
  VolumeX,
  Copy,
  Clock,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import { EarlyWarningAlert, RiskCategory } from '../types';
import { getRiskColorClass } from '../services/riskEngine';

interface AlertSystemProps {
  alerts: EarlyWarningAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onViewDetails: (alert: EarlyWarningAlert) => void;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({
  alerts,
  onAcknowledgeAlert,
  onViewDetails,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [shareSuccessId, setShareSuccessId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity === 'ALL') return true;
    return alert.severity === filterSeverity;
  });

  const handleShare = async (alert: EarlyWarningAlert) => {
    const text = `🚨 [NER DisasterGuard Alert - ${alert.severity}]
Hazard: ${alert.hazard}
Location: ${alert.location}, ${alert.district}, ${alert.state}
Time: ${alert.time}
Reason: ${alert.reason}
Action: ${alert.recommendedAction}
(Disaster Decision Support Prototype)`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `NER Disaster Alert: ${alert.hazard}`,
          text,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    // Fallback: Clipboard copy
    navigator.clipboard.writeText(text);
    setShareSuccessId(alert.id);
    setTimeout(() => setShareSuccessId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-5">
      {/* Alerts Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-bold tracking-wide uppercase">
              Early Warning Feed
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Live Broadcast Channel
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Early Warning Alerts & Evacuation Advisories
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Active meteorological threshold exceedances, geotechnical slope warnings, and river gauge alert status across NER.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound alert toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Siren audio active' : 'Siren muted'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="text-[11px] font-medium">{soundEnabled ? 'Audio On' : 'Muted'}</span>
          </button>

          {/* Severity Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            {['ALL', 'EXTREME', 'VERY_HIGH', 'HIGH'].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev === 'ALL' ? 'All Alerts' : sev.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3.5">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
            <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-base font-bold text-slate-300">
              No active alerts matching filter
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Select another severity level or check back as telemetry updates.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const colors = getRiskColorClass(alert.severity);

            return (
              <div
                key={alert.id}
                id={`alert-item-${alert.id}`}
                className={`relative overflow-hidden rounded-2xl bg-slate-900/95 border p-5 transition-all shadow-md backdrop-blur-sm ${
                  alert.isAcknowledged
                    ? 'border-slate-800 opacity-75'
                    : `${colors.border} shadow-lg`
                }`}
              >
                {/* Left accent color bar */}
                <div
                  className="absolute top-0 bottom-0 left-0 w-1.5"
                  style={{ backgroundColor: colors.fill }}
                />

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pl-2">
                  <div className="space-y-2 flex-1">
                    {/* Severity Pill & Hazard Title */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider border uppercase flex items-center gap-1.5"
                        style={{
                          backgroundColor: `${colors.fill}20`,
                          color: colors.fill,
                          borderColor: `${colors.fill}40`,
                        }}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {alert.severity.replace('_', ' ')} {alert.hazard}
                      </span>

                      {alert.isAcknowledged && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Acknowledged
                        </span>
                      )}

                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {alert.time}
                      </span>
                    </div>

                    {/* Location & District */}
                    <div className="flex items-center gap-1.5 text-slate-200 text-sm font-bold">
                      <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{alert.location}</span>
                      <span className="text-slate-500 font-normal">
                        ({alert.district}, {alert.state})
                      </span>
                    </div>

                    {/* Reason text */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <strong className="text-slate-100">Reason: </strong>
                      {alert.reason}
                    </p>

                    {/* Recommended action text */}
                    <div className="flex items-start gap-2 text-xs text-emerald-300 bg-emerald-950/20 border border-emerald-800/30 p-2.5 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-emerald-200">Recommended Action: </strong>
                        {alert.recommendedAction}
                      </div>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex flex-wrap lg:flex-col items-center gap-2 shrink-0 self-start pt-1">
                    <button
                      type="button"
                      id={`btn-view-alert-${alert.id}`}
                      onClick={() => onViewDetails(alert)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                      <span>View Details</span>
                    </button>

                    {!alert.isAcknowledged && (
                      <button
                        type="button"
                        id={`btn-ack-alert-${alert.id}`}
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    <button
                      type="button"
                      id={`btn-share-alert-${alert.id}`}
                      onClick={() => handleShare(alert)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {shareSuccessId === alert.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Share Alert</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
