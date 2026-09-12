import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Navigation,
  Search,
  Mountain,
  Gauge,
  Sparkles,
  Layers,
  CloudRain,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { LocationData } from '../types';
import { NER_LOCATIONS } from '../data/nerStates';

interface HeroLocationSelectorProps {
  currentLocation?: LocationData;
  selectedLocation?: LocationData;
  onSelectLocation: (loc: LocationData) => void;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
  onOpenMap?: () => void;
  onCustomLocation?: (lat: number, lon: number, name: string) => void;
  isLive?: boolean;
}

export const HeroLocationSelector: React.FC<HeroLocationSelectorProps> = ({
  currentLocation,
  selectedLocation,
  onSelectLocation,
  onAnalyze,
  isAnalyzing = false,
  onOpenMap,
  onCustomLocation,
  isLive = false,
}) => {
  const activeLocation = currentLocation || selectedLocation || NER_LOCATIONS[0];
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  // Manual Coordinates State
  const [manualName, setManualName] = useState('Custom Field Station');
  const [manualLat, setManualLat] = useState('25.5788');
  const [manualLon, setManualLon] = useState('91.8933');
  const [manualElevation, setManualElevation] = useState('1450');
  const [manualSlope, setManualSlope] = useState('36');
  const [manualTerrain, setManualTerrain] = useState<'Steep Mountain' | 'Hilly Uplands' | 'Valley/Foothills' | 'Floodplain' | 'Plateau'>('Steep Mountain');

  // Filtered locations for search bar
  const filteredLocations = searchQuery.trim()
    ? NER_LOCATIONS.filter(
        (loc) =>
          loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.state.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Detecting your GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;

        // Find nearest NER location or create user-detected profile
        let nearest = NER_LOCATIONS[0];
        let minDistance = Infinity;

        for (const loc of NER_LOCATIONS) {
          const d = Math.hypot(loc.latitude - latitude, loc.longitude - longitude);
          if (d < minDistance) {
            minDistance = d;
            nearest = loc;
          }
        }

        // If user is within ~300km of a known station, use that or adapt coordinates
        const userLoc: LocationData = {
          ...nearest,
          id: 'user-detected',
          name: `User Location (${nearest.district})`,
          latitude: +latitude.toFixed(4),
          longitude: +longitude.toFixed(4),
        };

        onSelectLocation(userLoc);
        setLocationStatus(`Locked: ${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E (Nearest: ${nearest.district}, ${nearest.state})`);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('Location access permission was denied. Please pick a location from the NER list below.');
        } else {
          setLocationStatus('Unable to determine location. Showing default NER station.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const keyQuickCities = [
    'cherrapunji',
    'shillong',
    'gangtok',
    'tawang',
    'haflong',
    'aizawl',
    'kohima',
    'guwahati',
  ];

  return (
    <div className="relative overflow-hidden pt-4 pb-8">
      {/* Background ambient lighting accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 bg-gradient-to-b from-cyan-600/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center sm:text-left">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>North Eastern Region Disaster Intelligence Platform</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Predict Risk. Prepare Early.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
                Protect Lives.
              </span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              AI-powered early warning and landslide risk monitoring for North Eastern India. Specifically assessing precipitation intensity, steep terrain, and soil moisture across the 8 NER states.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              <button
                type="button"
                id="btn-hero-check-location"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-sm font-semibold shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
              >
                {isLocating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                <span>Check My Location</span>
              </button>

              <button
                type="button"
                id="btn-hero-explore-map"
                onClick={onOpenMap}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Explore Risk Map</span>
              </button>
            </div>
          </div>

          {/* Key capability badge cards */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-md w-full mx-auto lg:mx-0">
            {[
              { icon: Sparkles, title: 'AI-Powered Risk', desc: 'Real-time hazard modeling' },
              { icon: CloudRain, title: 'Weather Telemetry', desc: 'Rainfall burst monitors' },
              { icon: Mountain, title: 'Landslide Engine', desc: 'Slope & soil saturation' },
              { icon: Layers, title: 'NER Geospatial', desc: '8 states comprehensive' },
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5 text-left backdrop-blur-sm"
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-slate-100">{f.title}</h2>
                    <p className="text-[11px] text-slate-400">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Location Selection Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-950/80 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Check Disaster Risk for Your Location
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Select your geographical location or pick on the interactive map to compute real-time calibrated disaster risk.
              </p>
            </div>

            {/* Two Main Mode Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="btn-use-current-location"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/90 hover:bg-cyan-900/90 border border-cyan-700/60 text-cyan-200 text-xs font-semibold transition-all cursor-pointer"
              >
                {isLocating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>Use My Current Location</span>
              </button>

              <button
                type="button"
                id="btn-select-location-map"
                onClick={onOpenMap}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Select Location on Map</span>
              </button>

              <button
                type="button"
                id="btn-toggle-manual-coordinates"
                onClick={() => setShowManualForm(!showManualForm)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  showManualForm
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>{showManualForm ? 'Close Coordinates Entry' : 'Manual Coordinates Entry'}</span>
              </button>
            </div>
          </div>

          {/* Manual Coordinate Entry Form */}
          {showManualForm && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900/95 border border-amber-500/30 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Manual GPS Coordinates & Terrain Input
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  NER Boundaries: 21.5°N–29.5°N, 88.0°E–97.5°E
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Location / Ridge Name
                  </label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-amber-400 focus:outline-none"
                    placeholder="e.g. Upper Shillong Ridge"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Latitude (°N)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Longitude (°E)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={manualLon}
                    onChange={(e) => setManualLon(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Elevation (m)
                  </label>
                  <input
                    type="number"
                    value={manualElevation}
                    onChange={(e) => setManualElevation(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Slope Angle (°)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="85"
                    value={manualSlope}
                    onChange={(e) => setManualSlope(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-medium text-slate-300">Terrain Type:</label>
                  <select
                    value={manualTerrain}
                    onChange={(e) => setManualTerrain(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Steep Mountain">Steep Mountain (&gt;35°)</option>
                    <option value="Hilly Uplands">Hilly Uplands (20°–35°)</option>
                    <option value="Valley/Foothills">Valley/Foothills (10°–20°)</option>
                    <option value="Floodplain">Floodplain (&lt;10°)</option>
                    <option value="Plateau">Plateau Tableland</option>
                  </select>
                </div>

                <button
                  type="button"
                  id="btn-apply-manual-coordinates"
                  onClick={() => {
                    const lat = parseFloat(manualLat) || 25.5788;
                    const lon = parseFloat(manualLon) || 91.8933;
                    const elev = parseInt(manualElevation, 10) || 1200;
                    const slope = parseInt(manualSlope, 10) || 35;

                    const customLocation: LocationData = {
                      id: `manual-${Date.now()}`,
                      name: manualName || 'Custom Station',
                      district: 'Manual Survey Point',
                      state: lat > 27 ? 'Arunachal Pradesh' : lat > 25 ? 'Meghalaya' : 'Assam',
                      latitude: lat,
                      longitude: lon,
                      elevationMeters: elev,
                      slopeDegrees: slope,
                      terrainType: manualTerrain,
                      historicalSusceptibility: slope > 35 ? 'High' : 'Moderate',
                      isCustomLocation: true,
                    };

                    onSelectLocation(customLocation);
                    if (onCustomLocation) {
                      onCustomLocation(lat, lon, manualName);
                    }
                    setShowManualForm(false);
                    setLocationStatus(`Applied manual coordinates: ${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E (${manualName})`);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold transition-all cursor-pointer self-end"
                >
                  Apply & Recalculate Risk
                </button>
              </div>
            </div>
          )}

          {locationStatus && (
            <div className="mt-3 px-3.5 py-2 rounded-lg bg-cyan-950/50 border border-cyan-800/50 text-xs text-cyan-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                {locationStatus}
              </span>
              <button
                type="button"
                onClick={() => setLocationStatus(null)}
                className="text-slate-400 hover:text-white text-xs underline ml-2 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Search bar with instant autocomplete */}
          <div className="mt-4 relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                id="input-location-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, district or location across Assam, Meghalaya, Sikkim, Arunachal..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
            {filteredLocations.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-800">
                {filteredLocations.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      onSelectLocation(loc);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800/80 flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                        {loc.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {loc.district} • {loc.state} • Elev: {loc.elevationMeters}m
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-mono">
                      {loc.slopeDegrees}° slope
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Select Location Pills */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-500 text-[11px] font-medium whitespace-nowrap mr-1">
              Popular NER Hubs:
            </span>
            {NER_LOCATIONS.filter((l) => keyQuickCities.includes(l.id)).map((loc) => {
              const isSelected = activeLocation.id === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  id={`pill-location-${loc.id}`}
                  onClick={() => onSelectLocation(loc)}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-lg transition-all text-xs font-medium cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {loc.name.split('(')[0].trim()}
                </button>
              );
            })}
          </div>

          {/* Currently Selected Location Details Card */}
          <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 w-full">
              <div className="col-span-2 sm:col-span-2 md:col-span-2">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Selected Location
                </span>
                <p className="text-sm font-bold text-white truncate">
                  {activeLocation.name}
                </p>
                <p className="text-xs text-slate-400">
                  {activeLocation.district}, {activeLocation.state}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Coordinates
                </span>
                <p className="text-xs font-mono font-medium text-slate-300">
                  {activeLocation.latitude.toFixed(3)}°N
                </p>
                <p className="text-xs font-mono font-medium text-slate-300">
                  {activeLocation.longitude.toFixed(3)}°E
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Elevation
                </span>
                <p className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <Mountain className="w-3.5 h-3.5 text-cyan-400" />
                  {activeLocation.elevationMeters} m AMSL
                </p>
                <span className="text-[10px] text-slate-400">
                  {activeLocation.terrainType}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Slope Angle
                </span>
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  {activeLocation.slopeDegrees}° Steepness
                </p>
                <span className="text-[10px] text-slate-400">
                  Critical range: 30°–50°
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  GSI History
                </span>
                <p className="text-xs font-semibold text-slate-200">
                  {activeLocation.historicalSusceptibility} Susceptibility
                </p>
                <span className="text-[10px] text-slate-400">
                  Himalayan regolith
                </span>
              </div>
            </div>

            {/* Big Action CTA: Analyze Current Conditions */}
            <div className="shrink-0 flex items-center justify-end">
              <button
                type="button"
                id="btn-analyze-current-conditions"
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:from-cyan-700 active:to-blue-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-950/60 transition-all cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                    <span>Analyzing Geospatial Telemetry...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>Analyze Current Conditions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
