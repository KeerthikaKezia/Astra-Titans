import React, { useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  CheckSquare,
  Square,
  AlertOctagon,
  AlertTriangle,
  Info,
  ExternalLink,
  LifeBuoy,
  HeartHandshake,
  Compass,
  Radio,
  FileText,
  Volume2,
} from 'lucide-react';

export const EmergencyPreparedness: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BEFORE' | 'DURING' | 'AFTER'>('BEFORE');
  const [kitItems, setKitItems] = useState([
    { id: 'water', text: 'Potable Water (3-day supply, 3L/person/day)', checked: true },
    { id: 'food', text: 'Non-perishable canned food & dry rations', checked: true },
    { id: 'firstaid', text: 'Comprehensive First-Aid Kit with sterile bandages & antiseptics', checked: true },
    { id: 'flashlight', text: 'High-lumen Flashlight with spare dry cells/batteries', checked: false },
    { id: 'radio', text: 'Battery or hand-crank AM/FM emergency radio for IMD bulletins', checked: false },
    { id: 'whistle', text: 'High-pitch Emergency Whistle (to signal search & rescue teams)', checked: true },
    { id: 'powerbank', text: 'Charged USB Power Bank (10,000+ mAh) for mobile phones', checked: false },
    { id: 'docs', text: 'Waterproof pouch for Aadhaar cards, deeds, insurance & prescriptions', checked: false },
    { id: 'mask', text: 'N95 dust masks and heavy-duty nitrile work gloves', checked: false },
    { id: 'blanket', text: 'Thermal survival foil blanket & rain poncho', checked: false },
  ]);

  const toggleCheck = (id: string) => {
    setKitItems((items) =>
      items.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  };

  const checkedCount = kitItems.filter((i) => i.checked).length;
  const progressPct = Math.round((checkedCount / kitItems.length) * 100);

  const guidelines = {
    BEFORE: [
      {
        title: 'Monitor Rainfall & GSI Bulletins',
        desc: 'Track local automatic weather stations, IMD nowcasts, and NER DisasterGuard threshold advisories during heavy monsoon spells.',
      },
      {
        title: 'Watch for Slope Warning Signs',
        desc: 'Inspect cut-slopes and retaining walls for new surface tension cracks, sudden ground bulging, tilting utility poles/trees, or sudden seepage of muddy water from hillside.',
      },
      {
        title: 'Plan Immediate Evacuation Routes',
        desc: 'Identify at least two elevated, non-slope escape paths leading to recognized community cyclone/disaster relief centers.',
      },
      {
        title: 'Clear Drainage Culverts',
        desc: 'Keep residential roof gutters and roadside natural storm-water ditches clear of silt, fallen bamboo, and debris to avoid hydrostatic pressure behind slopes.',
      },
    ],
    DURING: [
      {
        title: 'Immediate Evacuation Order',
        desc: 'If local civil administration, village head (Gaonburha), or DisasterGuard issues an evacuation notice, leave immediately without delaying to retrieve heavy belongings.',
      },
      {
        title: 'Move Perpendicular to Debris Path',
        desc: 'Run across the slope away from the path of the mudflow or rock cascade. Do NOT run downhill ahead of the debris flow.',
      },
      {
        title: 'Avoid Drainage Channels & River Gorges',
        desc: 'Debris flows travel at violent speeds down natural gullies and riverbeds. Keep to ridge crests and stable bedrock formations.',
      },
      {
        title: 'Curl Into Ball If Trapped',
        desc: 'If escape is physically blocked, drop to the ground, curl into a tight fetal ball, and tightly protect your head and neck with your arms and hands.',
      },
    ],
    AFTER: [
      {
        title: 'Stay Completely Clear of Slide Scarp',
        desc: 'Secondary and tertiary collapses frequently follow within hours or days as saturated upper scarps lose equilibrium.',
      },
      {
        title: 'Assist Without Entering Active Zone',
        desc: 'Direct search and rescue personnel (NDRF/SDRF) to known trapped locations. Do not enter unstable muddy slurry without safety tethers.',
      },
      {
        title: 'Inspect Damaged Utilities',
        desc: 'Report downed electrical lines, snapped water supply pipes, and ruptured LPG cylinders immediately to emergency authorities.',
      },
      {
        title: 'Tune to Emergency Broadcasts',
        desc: 'Keep battery-powered radios tuned to All India Radio (AIR) and DD North East for relief camp locations, drinking water points, and medical dispensaries.',
      },
    ],
  };

  const emergencyContacts = [
    { name: 'National Emergency Helpline', number: '112', desc: 'Single national SOS number for police, fire, rescue' },
    { name: 'Disaster Management Helpline', number: '1070 / 1077', desc: 'National & State Emergency Operations Centre (SEOC)' },
    { name: 'Ambulance / Emergency Medical', number: '108 / 102', desc: 'Emergency trauma transport & paramedic response' },
    { name: 'National Disaster Response Force (NDRF)', number: '011-24363260', desc: 'NER 1st Battalion HQ (Guwahati) 24/7 Control Room' },
    { name: 'Fire & Emergency Services', number: '101', desc: 'Structural collapse & swift-water extrication' },
    { name: 'Women Helpline', number: '1091 / 181', desc: 'Disaster camp safety & emergency transit support' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold tracking-wide uppercase">
              Civil Defense & SOPs
            </span>
            <span className="text-xs text-slate-400 font-mono">
              NDMA Approved Protocols
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Disaster Preparedness & Landslide Safety Directives
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Standard operating procedures, emergency kit readiness tracker, and verified NER emergency response hotlines.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-2 rounded-xl">
          <HeartHandshake className="w-4 h-4" />
          <span>Preparedness Saves Lives</span>
        </div>
      </div>

      {/* Main Grid: Phase Tabs (Before/During/After) + Emergency Kit Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Phase Tabs & Step-by-Step SOPs */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Landslide Safety Action Protocol
            </h3>
            <span className="text-xs text-slate-400">
              Select Phase:
            </span>
          </div>

          {/* Phase Navigation Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {[
              { id: 'BEFORE', label: '1. Before Event', desc: 'Precaution' },
              { id: 'DURING', label: '2. During Event', desc: 'Survival' },
              { id: 'AFTER', label: '3. After Event', desc: 'Recovery' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                id={`btn-sop-tab-${tab.id.toLowerCase()}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div>{tab.label}</div>
                <span className="text-[10px] font-normal opacity-80">{tab.desc}</span>
              </button>
            ))}
          </div>

          {/* SOP Cards for Active Phase */}
          <div className="space-y-3 mt-4">
            {guidelines[activeTab].map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-start gap-3.5"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Emergency Kit Interactive Checklist */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-emerald-400" />
                72-Hour "Go-Bag" Survival Kit
              </h3>
              <p className="text-xs text-slate-400">
                Interactive readiness checklist for household emergency gear.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {checkedCount}/{kitItems.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Readiness: {progressPct}% Complete</span>
              <span>{progressPct === 100 ? 'Fully Prepared!' : 'Check all items'}</span>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {kitItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer select-none transition-colors ${
                  item.checked
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {item.checked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <span className={`text-xs ${item.checked ? 'line-through text-slate-400' : 'text-slate-300'}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Helpline Directory Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              Verified Emergency Hotline Directory (North Eastern Region)
            </h3>
            <p className="text-xs text-slate-400">
              Direct dial access to State Disaster Management Authorities (SDMA), NDRF, and emergency trauma dispatch.
            </p>
          </div>
          <span className="text-xs font-mono text-rose-400 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-800/50">
            Toll-Free 24×7 Operations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {emergencyContacts.map((contact, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-start justify-between gap-3"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  {contact.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {contact.desc}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300 font-mono font-bold text-sm">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                  <span>{contact.number}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
