import React, { useState, useMemo } from 'react';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Sparkles,
  Mountain,
  AlertTriangle,
  CloudRain,
  ShieldCheck,
  Compass,
  Eye,
  Info,
} from 'lucide-react';
import { LocationData, RiskCategory } from '../types';
import { NER_LOCATIONS } from '../data/nerStates';
import { calculateLandslideRisk, getRiskCategory, getRiskColorClass } from '../services/riskEngine';
import { getDemoWeatherData } from '../services/weatherService';

interface InteractiveRiskMapProps {
  selectedLocation: LocationData;
  onSelectLocation: (loc: LocationData) => void;
  isDemoMode: boolean;
}

export const InteractiveRiskMap: React.FC<InteractiveRiskMapProps> = ({
  selectedLocation,
  onSelectLocation,
  isDemoMode,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activePopupLocation, setActivePopupLocation] = useState<LocationData | null>(selectedLocation);
  const [showLandslideZones, setShowLandslideZones] = useState(true);
  const [showRainfallLayer, setShowRainfallLayer] = useState(true);
  const [showRiverLayer, setShowRiverLayer] = useState(true);

  // Map coordinate projection bounds for North Eastern India:
  // Longitude: 88.0°E (West Sikkim) to 97.5°E (East Arunachal Pradesh)
  // Latitude: 21.8°N (South Mizoram) to 29.5°N (North Arunachal/Sikkim)
  const mapBounds = {
    minLon: 88.0,
    maxLon: 97.5,
    minLat: 21.8,
    maxLat: 29.5,
  };

  const projectCoord = (lat: number, lon: number) => {
    // Width 900, Height 650
    const x = ((lon - mapBounds.minLon) / (mapBounds.maxLon - mapBounds.minLon)) * 900;
    // Invert Y because SVG coordinates go top-to-bottom
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 650;
    return { x, y };
  };

  // Precompute risks for all NER stations
  const locationRisks = useMemo(() => {
    return NER_LOCATIONS.map((loc) => {
      const weather = getDemoWeatherData(loc);
      const assessment = calculateLandslideRisk(loc, weather);
      const pos = projectCoord(loc.latitude, loc.longitude);
      return {
        location: loc,
        weather,
        assessment,
        pos,
      };
    });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.8, z - 0.25));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const activePopupData = useMemo(() => {
    if (!activePopupLocation) return null;
    return locationRisks.find((item) => item.location.id === activePopupLocation.id) || locationRisks[0];
  }, [activePopupLocation, locationRisks]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Map Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Interactive Geospatial Risk Map — North Eastern Region
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizing landslide susceptibility corridors, river basins, and meteorological hotspots across all 8 NER states.
            </p>
          </div>

          {/* Layer toggles & Zoom Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setShowLandslideZones(!showLandslideZones)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  showLandslideZones
                    ? 'bg-rose-500/20 text-rose-300 font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Landslide Zones
              </button>
              <button
                type="button"
                onClick={() => setShowRainfallLayer(!showRainfallLayer)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  showRainfallLayer
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Rainfall Radar
              </button>
              <button
                type="button"
                onClick={() => setShowRiverLayer(!showRiverLayer)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  showRiverLayer
                    ? 'bg-blue-500/20 text-blue-300 font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Brahmaputra/Rivers
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                id="btn-map-zoom-in"
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="btn-map-zoom-out"
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="btn-map-reset"
                onClick={handleResetView}
                className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Map Canvas Container */}
        <div
          className="relative w-full h-[520px] bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* SVG Map Canvas with Pan & Zoom */}
          <svg
            viewBox="0 0 900 650"
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <defs>
              {/* Gradients for terrain and danger zones */}
              <radialGradient id="highRiskGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="extremeRiskGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="brahmaputraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Grid coordinates */}
            <g opacity="0.12" stroke="#64748b" strokeWidth="0.5" strokeDasharray="4 4">
              <line x1="100" y1="0" x2="100" y2="650" />
              <line x1="250" y1="0" x2="250" y2="650" />
              <line x1="400" y1="0" x2="400" y2="650" />
              <line x1="550" y1="0" x2="550" y2="650" />
              <line x1="700" y1="0" x2="700" y2="650" />
              <line x1="850" y1="0" x2="850" y2="650" />
              <line x1="0" y1="150" x2="900" y2="150" />
              <line x1="0" y1="300" x2="900" y2="300" />
              <line x1="0" y1="450" x2="900" y2="450" />
              <line x1="0" y1="600" x2="900" y2="600" />
            </g>

            {/* State Boundaries (Stylized Polygons representing 8 NER States) */}
            {/* Sikkim */}
            <path
              d="M 50,150 L 100,120 L 120,180 L 80,210 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.5"
              className="hover:fill-slate-800 transition-colors"
            />
            {/* Arunachal Pradesh (Northern Himalayan Crescent) */}
            <path
              d="M 280,70 L 450,40 L 720,60 L 860,160 L 800,240 L 680,200 L 520,220 L 360,180 L 290,140 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.5"
              className="hover:fill-slate-800 transition-colors"
            />
            {/* Assam (Brahmaputra Valley & Hill tracts) */}
            <path
              d="M 250,220 L 380,200 L 640,180 L 750,240 L 650,300 L 520,320 L 420,360 L 320,340 L 220,300 L 240,240 Z"
              fill="#0b1329"
              stroke="#3b82f6"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              className="hover:fill-slate-800/80 transition-colors"
            />
            {/* Meghalaya (Shillong Plateau & Khasi/Garo Hills) */}
            <path
              d="M 220,310 L 380,310 L 390,360 L 340,380 L 200,370 L 200,330 Z"
              fill="#111c44"
              stroke="#475569"
              strokeWidth="1.5"
              className="hover:fill-slate-800 transition-colors"
            />
            {/* Nagaland */}
            <path
              d="M 640,280 L 740,260 L 760,340 L 680,380 L 630,340 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Manipur */}
            <path
              d="M 620,370 L 700,360 L 710,480 L 630,490 L 590,430 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Mizoram */}
            <path
              d="M 500,470 L 580,450 L 570,610 L 480,590 L 480,520 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Tripura */}
            <path
              d="M 370,440 L 450,440 L 440,540 L 360,530 L 350,470 Z"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* Rivers Layer */}
            {showRiverLayer && (
              <g id="river-layers">
                {/* Brahmaputra Main River Channel */}
                <path
                  d="M 820,180 Q 700,190 560,210 T 360,260 T 200,270 T 140,350"
                  fill="none"
                  stroke="url(#brahmaputraGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <text x="520" y="200" fill="#38bdf8" fontSize="9" fontWeight="bold" opacity="0.8">
                  Brahmaputra River
                </text>
                {/* Teesta River */}
                <path
                  d="M 85,120 Q 95,170 120,260"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
                {/* Barak River */}
                <path
                  d="M 620,440 Q 520,460 400,430 T 280,480"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* High-Risk Zones Heat Layer */}
            {showLandslideZones && (
              <g id="landslide-zones">
                {/* Cherrapunji / Mawsynram Escarpment */}
                <circle cx="350" cy="360" r="50" fill="url(#extremeRiskGradient)" />
                {/* Tawang / Sela Pass Corridor */}
                <circle cx="360" cy="150" r="45" fill="url(#extremeRiskGradient)" />
                {/* Gangtok / North Sikkim Himalayan Belt */}
                <circle cx="85" cy="165" r="40" fill="url(#extremeRiskGradient)" />
                {/* Dima Hasao / Haflong Hill Section */}
                <circle cx="480" cy="370" r="45" fill="url(#highRiskGradient)" />
                {/* Kohima / Barail Slopes */}
                <circle cx="680" cy="340" r="40" fill="url(#highRiskGradient)" />
                {/* Aizawl Ridge */}
                <circle cx="530" cy="520" r="35" fill="url(#highRiskGradient)" />
              </g>
            )}

            {/* State Text Labels */}
            <g fill="#94a3b8" fontSize="11" fontWeight="bold" opacity="0.6">
              <text x="60" y="160">SIKKIM</text>
              <text x="500" y="110">ARUNACHAL PRADESH</text>
              <text x="440" y="270">ASSAM</text>
              <text x="240" y="350">MEGHALAYA</text>
              <text x="680" y="310">NAGALAND</text>
              <text x="640" y="420">MANIPUR</text>
              <text x="510" y="540">MIZORAM</text>
              <text x="380" y="490">TRIPURA</text>
            </g>

            {/* Interactive Location Markers */}
            {locationRisks.map(({ location: loc, assessment, pos }) => {
              const isSelected = selectedLocation.id === loc.id;
              const isHovered = activePopupLocation?.id === loc.id;
              const colors = getRiskColorClass(assessment.category);
              const isSevere = assessment.score >= 61;

              return (
                <g
                  key={loc.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePopupLocation(loc);
                    onSelectLocation(loc);
                  }}
                >
                  {/* Radar pulse for high/extreme risks */}
                  {isSevere && (
                    <circle
                      r="16"
                      fill={colors.fill}
                      opacity="0.25"
                      className="animate-ping origin-center"
                    />
                  )}

                  {/* Outer ring */}
                  <circle
                    r={isSelected ? '10' : '7'}
                    fill="#020617"
                    stroke={colors.fill}
                    strokeWidth={isSelected ? '3' : '2'}
                  />

                  {/* Inner center core */}
                  <circle
                    r={isSelected ? '5' : '3.5'}
                    fill={colors.fill}
                  />

                  {/* Station Label */}
                  <text
                    x="12"
                    y="4"
                    fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                    fontSize={isSelected ? '11' : '9.5'}
                    fontWeight={isSelected ? 'bold' : '600'}
                    className="select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                  >
                    {loc.name.split('(')[0].trim()}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Interactive Popup Info Card */}
          {activePopupData && (
            <div className="absolute top-4 right-4 z-20 w-80 max-w-[calc(100%-32px)] bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                    Geospatial Station
                  </span>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {activePopupData.location.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activePopupData.location.district} • {activePopupData.location.state}
                  </p>
                </div>
                <div
                  className="px-2 py-0.5 rounded text-[10px] font-black border uppercase"
                  style={{
                    backgroundColor: `${getRiskColorClass(activePopupData.assessment.category).fill}20`,
                    color: getRiskColorClass(activePopupData.assessment.category).fill,
                    borderColor: `${getRiskColorClass(activePopupData.assessment.category).fill}40`,
                  }}
                >
                  {activePopupData.assessment.category.replace('_', ' ')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                <div className="bg-slate-950 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Landslide Risk</span>
                  <span className="text-base font-black text-white font-mono">
                    {activePopupData.assessment.score}/100
                  </span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Slope & Elev</span>
                  <span className="text-xs font-bold text-slate-200">
                    {activePopupData.location.slopeDegrees}° • {activePopupData.location.elevationMeters}m
                  </span>
                </div>
              </div>

              <div className="mt-2.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold mb-1">
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>24h Rain: {activePopupData.weather.rainfallLast24hMm.toFixed(0)}mm • {activePopupData.weather.condition}</span>
                </div>
                <p className="text-slate-400 leading-snug">
                  {activePopupData.assessment.recommendedActions[0] || 'Monitor official weather advisories.'}
                </p>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  id="btn-popup-select-location"
                  onClick={() => onSelectLocation(activePopupData.location)}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze This Location</span>
                </button>
              </div>
            </div>
          )}

          {/* Map Controls Helper Badge */}
          <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/85 border border-slate-800 text-[11px] text-slate-400 backdrop-blur-sm">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click any marker to inspect • Click & drag to pan • Scroll to zoom</span>
          </div>
        </div>

        {/* Map Legend Bar */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Hazard Scale:</span>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low (0–20)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Moderate (21–40)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High (41–60)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Very High (61–80)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Extreme (81–100)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              Projection: WGS84 NER
            </span>
            <span>{NER_LOCATIONS.length} Telemetry Stations Monitored</span>
          </div>
        </div>
      </div>
    </div>
  );
};
