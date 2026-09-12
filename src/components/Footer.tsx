import React from 'react';
import {
  ShieldAlert,
  PhoneCall,
  Info,
  Radio,
  ExternalLink,
  Heart,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Subtitle */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-white tracking-wide block">
                  NER DisasterGuard
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  Early Warning & Risk Monitoring
                </span>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              An AI-powered geotechnical and meteorological decision-support prototype tailored specifically for the rugged terrain, river basins, and monsoonal dynamics of the North Eastern Region of India.
            </p>
          </div>

          {/* Col 2: Emergency Helplines */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
              Emergency Quick Dial
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex justify-between border-b border-slate-900 pb-1">
                <span>National Emergency Number:</span>
                <strong className="text-rose-400 font-mono">112</strong>
              </li>
              <li className="flex justify-between border-b border-slate-900 pb-1">
                <span>Disaster Management (NDMA):</span>
                <strong className="text-rose-400 font-mono">1070 / 1077</strong>
              </li>
              <li className="flex justify-between border-b border-slate-900 pb-1">
                <span>Emergency Ambulance:</span>
                <strong className="text-rose-400 font-mono">108 / 102</strong>
              </li>
              <li className="flex justify-between pb-1">
                <span>NDRF Control Room (Guwahati):</span>
                <strong className="text-rose-400 font-mono">011-24363260</strong>
              </li>
            </ul>
          </div>

          {/* Col 3: Scientific Data Sources */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              Institutional Data Feeds
            </h4>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>• Geological Survey of India (GSI) Macro-Zonation</li>
              <li>• India Meteorological Department (IMD) Precipitation Grid</li>
              <li>• Central Water Commission (CWC) River Basins</li>
              <li>• North Eastern Space Applications Centre (NESAC)</li>
              <li>• Open-Meteo High-Resolution Atmospheric Telemetry</li>
              <li>• Google Gemini AI Multimodal Analysis</li>
            </ul>
          </div>

          {/* Col 4: Statutory Prototype Disclaimer */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Prototype Disclaimer
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
              <strong>Prototype Decision-Support System: </strong>
              Risk assessments are estimated based on mathematical models, telemetry feeds, and geotechnical proxies. For official alerts and life-safety evacuation orders, always adhere strictly to bulletins issued by IMD, NDMA, and State Disaster Management Authorities (SDMA).
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} NER DisasterGuard. Engineered for the 8 States of North Eastern India.
          </p>
          <div className="flex items-center gap-4">
            <span>Status: All Regional Nodes Operational</span>
            <span>•</span>
            <span>WGS84 Coordinate Grid</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
