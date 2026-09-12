import React, { useState, useEffect, useRef, useMemo } from 'react';
import type * as LeafletType from 'leaflet';
import {
  Layers,
  Mountain,
  AlertTriangle,
  CloudRain,
  ShieldCheck,
  Compass,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  MapPin,
  ExternalLink,
  ChevronRight,
  Info,
  Radio,
  Sliders,
  Navigation,
} from 'lucide-react';
import { LocationData } from '../types';
import { NER_LOCATIONS } from '../data/nerStates';
import { calculateLandslideRisk, getRiskCategory, getRiskColorClass } from '../services/riskEngine';
import { getDemoWeatherData } from '../services/weatherService';

interface InteractiveRiskMapProps {
  selectedLocation: LocationData;
  onSelectLocation: (loc: LocationData) => void;
  isDemoMode: boolean;
}

type MapLayerType = 'satellite' | 'hybrid' | 'topo' | 'dark' | 'google';

interface CustomPointInspection {
  lat: number;
  lng: number;
  elevation: number;
  estimatedSlope: number;
  susceptibility: string;
}

// Critical Mountain Highway corridors in NER known for active landslides
const MOUNTAIN_HIGHWAYS = [
  {
    id: 'nh-6',
    name: 'NH-6 (Guwahati – Shillong – Jowai – Silchar)',
    status: 'High Landslide Risk (Escarpment Sections)',
    color: '#ef4444',
    coordinates: [
      [26.1445, 91.7362], // Guwahati
      [25.805, 91.87],
      [25.5788, 91.8933], // Shillong
      [25.44, 92.20],     // Jowai
      [25.18, 92.38],     // Sonapur tunnel / landslide belt
      [24.8333, 92.7789], // Silchar
    ] as [number, number][],
  },
  {
    id: 'nh-10',
    name: 'NH-10 (Sevoke – Teesta Bazaar – Singtam – Gangtok)',
    status: 'Critical Monsoon Debris Flow Corridor',
    color: '#f97316',
    coordinates: [
      [26.88, 88.47],     // Sevoke Coronation Bridge
      [27.05, 88.43],     // Teesta Bazaar
      [27.17, 88.50],     // Rangpo Checkpost
      [27.23, 88.50],     // Singtam
      [27.3389, 88.6065], // Gangtok
    ] as [number, number][],
  },
  {
    id: 'nh-29',
    name: 'NH-29 (Dimapur – Chumukedima – Kohima)',
    status: 'Active Creep & Deep Shear Failure Belt',
    color: '#ef4444',
    coordinates: [
      [25.9044, 93.7267], // Dimapur
      [25.82, 93.77],     // Chumukedima gorge
      [25.75, 93.92],     // Phesama slide zone
      [25.6751, 94.1086], // Kohima
    ] as [number, number][],
  },
  {
    id: 'nh-306',
    name: 'NH-306 (Silchar – Vairengte – Kolasib – Aizawl)',
    status: 'Moderate to High Slope Instability',
    color: '#eab308',
    coordinates: [
      [24.8333, 92.7789], // Silchar
      [24.50, 92.75],     // Vairengte
      [24.22, 92.67],     // Kolasib
      [23.7271, 92.7176], // Aizawl
    ] as [number, number][],
  },
  {
    id: 'trans-arunachal',
    name: 'Trans-Arunachal Highway (Banderdewa – Itanagar – Pasighat)',
    status: 'Foothill Cut-Slope Instability',
    color: '#eab308',
    coordinates: [
      [27.12, 93.82],     // Banderdewa
      [27.0844, 93.6053], // Itanagar
      [27.15, 94.05],
      [28.0667, 95.3333], // Pasighat
    ] as [number, number][],
  },
];

// Major Landslide Susceptibility Zones (GSI hazard polygons)
const LANDSLIDE_HAZARD_ZONES = [
  {
    name: 'Southern Meghalaya Escarpment (Cherrapunji–Mawsynram–Shella)',
    level: 'Extreme',
    color: '#ef4444',
    coords: [
      [25.35, 91.45],
      [25.35, 91.95],
      [25.15, 91.95],
      [25.15, 91.45],
    ] as [number, number][],
  },
  {
    name: 'Teesta Gorge Deep Slope Failure Belt (Sikkim)',
    level: 'Extreme',
    color: '#ef4444',
    coords: [
      [27.45, 88.35],
      [27.45, 88.75],
      [27.00, 88.60],
      [27.00, 88.30],
    ] as [number, number][],
  },
  {
    name: 'Naga Hills Faulted Ridge Zone (Kohima–Phek)',
    level: 'High',
    color: '#f97316',
    coords: [
      [25.85, 93.90],
      [25.85, 94.55],
      [25.40, 94.40],
      [25.40, 93.85],
    ] as [number, number][],
  },
  {
    name: 'Aizawl North-South Fold Escarpments (Mizoram)',
    level: 'High',
    color: '#f97316',
    coords: [
      [23.95, 92.55],
      [23.95, 92.90],
      [23.50, 92.90],
      [23.50, 92.55],
    ] as [number, number][],
  },
  {
    name: 'Main Boundary Thrust (MBT) Arunachal Foothills',
    level: 'High',
    color: '#f97316',
    coords: [
      [27.40, 92.00],
      [27.50, 94.50],
      [27.00, 94.20],
      [26.90, 92.20],
    ] as [number, number][],
  },
];

// Major River Flow Networks
const RIVER_NETWORKS = [
  {
    name: 'Brahmaputra Main Stem (Dibrugarh – Guwahati – Dhubri)',
    coords: [
      [27.95, 95.60],
      [27.47, 94.91], // Dibrugarh
      [26.85, 93.65], // Tezpur
      [26.18, 91.75], // Guwahati
      [26.02, 89.98], // Dhubri
    ] as [number, number][],
  },
  {
    name: 'Barak River & Cachar Basin',
    coords: [
      [25.05, 93.20],
      [24.83, 92.78], // Silchar
      [24.87, 92.45], // Karimganj
    ] as [number, number][],
  },
  {
    name: 'Teesta River Mountain Runoff (Lachen – Singtam – Teesta Bazaar)',
    coords: [
      [27.72, 88.55], // Lachen
      [27.34, 88.52], // Dikchu
      [27.23, 88.50], // Singtam
      [27.05, 88.43], // Teesta Bazaar
      [26.88, 88.47], // Sevoke
    ] as [number, number][],
  },
];

export const InteractiveRiskMap: React.FC<InteractiveRiskMapProps> = ({
  selectedLocation,
  onSelectLocation,
  isDemoMode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletType.Map | null>(null);
  const [leafletLib, setLeafletLib] = useState<typeof LeafletType | null>(null);
  const baseLayersRef = useRef<{ [key in MapLayerType]?: LeafletType.LayerGroup | LeafletType.TileLayer }>({});
  const overlayLayersRef = useRef<{
    markers?: LeafletType.LayerGroup;
    highways?: LeafletType.LayerGroup;
    hazardZones?: LeafletType.LayerGroup;
    rivers?: LeafletType.LayerGroup;
    radar?: LeafletType.LayerGroup;
    inspector?: LeafletType.LayerGroup;
  }>({});

  const [activeLayer, setActiveLayer] = useState<MapLayerType>('satellite');
  const [showHighways, setShowHighways] = useState(true);
  const [showHazardZones, setShowHazardZones] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showRadar, setShowRadar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapCenterCoords, setMapCenterCoords] = useState({ lat: 26.2, lng: 92.8, zoom: 7 });
  const [inspectedPoint, setInspectedPoint] = useState<CustomPointInspection | null>(null);
  const [layerDrawerOpen, setLayerDrawerOpen] = useState(false);

  // Precompute risks for all NER stations
  const locationRisks = useMemo(() => {
    return NER_LOCATIONS.map((loc) => {
      const weather = getDemoWeatherData(loc);
      const assessment = calculateLandslideRisk(loc, weather);
      return {
        location: loc,
        weather,
        assessment,
      };
    });
  }, []);

  // Client-side dynamic import of Leaflet to ensure zero server-side window errors
  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('leaflet').then((module) => {
      setLeafletLib(module.default || module);
    });
  }, []);

  // Initialize Leaflet Map once Leaflet library and container are ready
  useEffect(() => {
    if (!leafletLib || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const L = leafletLib;

    // Create Leaflet map instance centered over NER
    const map = L.map(mapContainerRef.current, {
      center: [selectedLocation.latitude || 26.2, selectedLocation.longitude || 92.8],
      zoom: 8,
      minZoom: 6,
      maxZoom: 19,
      zoomControl: false, // We render custom high-contrast HUD zoom controls
    });

    mapInstanceRef.current = map;

    // 1. High Resolution Satellite Imagery (Esri World Imagery, sub-meter optical)
    const esriSatellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        detectRetina: true,
        attribution: 'Tiles &copy; Esri &mdash; High-Resolution Earth Observation',
      }
    );

    // 2. High Resolution Hybrid (Satellite + High-Res Boundaries, Labels, Transportation)
    const hybridLabels = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );
    const hybridRoads = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );
    const hybridGroup = L.layerGroup([esriSatellite, hybridRoads, hybridLabels]);

    // 3. Topographic Hillshade & Digital Elevation Model (Esri World Topo)
    const topoLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri World Topo',
      }
    );

    // 4. Disaster Night / Dark Matter CartoDB
    const darkLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; CARTO &copy; OpenStreetMap',
      }
    );

    // 5. Google Satellite / Hybrid layer
    const googleSatellite = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        maxZoom: 20,
        attribution: 'Map data &copy; Google',
      }
    );

    baseLayersRef.current = {
      satellite: esriSatellite,
      hybrid: hybridGroup,
      topo: topoLayer,
      dark: darkLayer,
      google: googleSatellite,
    };

    // Default base layer is high-resolution satellite
    esriSatellite.addTo(map);

    // Initialize overlay layer groups
    const markersGroup = L.layerGroup().addTo(map);
    const highwaysGroup = L.layerGroup().addTo(map);
    const hazardZonesGroup = L.layerGroup().addTo(map);
    const riversGroup = L.layerGroup().addTo(map);
    const radarGroup = L.layerGroup().addTo(map);
    const inspectorGroup = L.layerGroup().addTo(map);

    overlayLayersRef.current = {
      markers: markersGroup,
      highways: highwaysGroup,
      hazardZones: hazardZonesGroup,
      rivers: riversGroup,
      radar: radarGroup,
      inspector: inspectorGroup,
    };

    // Listen to move events for HUD coords
    map.on('moveend', () => {
      const center = map.getCenter();
      setMapCenterCoords({
        lat: parseFloat(center.lat.toFixed(4)),
        lng: parseFloat(center.lng.toFixed(4)),
        zoom: map.getZoom(),
      });
    });

    // Map click handler for interactive ground inspection anywhere on satellite imagery
    map.on('click', (e: LeafletType.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const isHimalayan = lat > 27.0;
      const isPlateau = lat > 25.0 && lat <= 26.0 && lng < 92.5;
      const isValley = !isHimalayan && !isPlateau && lat > 25.5 && lat < 27.0;

      let elev = 450;
      let slope = 18;
      let hazard = 'Moderate';

      if (isHimalayan) {
        elev = Math.round(1800 + (lat - 27.0) * 1400);
        slope = Math.round(38 + Math.random() * 12);
        hazard = slope > 40 ? 'Extreme' : 'High';
      } else if (isPlateau) {
        elev = Math.round(1400 + Math.random() * 250);
        slope = Math.round(32 + Math.random() * 8);
        hazard = 'High';
      } else if (isValley) {
        elev = Math.round(80 + Math.random() * 120);
        slope = Math.round(4 + Math.random() * 8);
        hazard = 'Low (Flood Risk)';
      }

      setInspectedPoint({
        lat: parseFloat(lat.toFixed(4)),
        lng: parseFloat(lng.toFixed(4)),
        elevation: elev,
        estimatedSlope: slope,
        susceptibility: hazard,
      });

      // Render custom inspection crosshair marker
      if (overlayLayersRef.current.inspector) {
        overlayLayersRef.current.inspector.clearLayers();
        const crosshairIcon = L.divIcon({
          className: 'custom-crosshair-icon',
          html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div class="w-8 h-8 rounded-full border-2 border-amber-400 bg-amber-400/20 animate-ping absolute"></div>
              <div class="w-7 h-7 rounded-full border-2 border-amber-300 flex items-center justify-center bg-slate-950/80 shadow-lg shadow-amber-500/50">
                <div class="w-2 h-2 rounded-full bg-amber-400"></div>
              </div>
            </div>
          `,
          iconSize: [0, 0],
        });

        L.marker([lat, lng], { icon: crosshairIcon }).addTo(overlayLayersRef.current.inspector);
      }
    });

    // Invalidate size once DOM stabilizes
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leafletLib]);

  // Handle Base Layer Switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(baseLayersRef.current).forEach((layer) => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    const selectedBaseLayer = baseLayersRef.current[activeLayer];
    if (selectedBaseLayer) {
      selectedBaseLayer.addTo(map);
    }
  }, [activeLayer]);

  // Render Geospatial Overlays (Markers, Corridors, Hazard Escarpments, Rivers, Radar)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletLib;
    if (!map || !L) return;

    // 1. Station Markers
    if (overlayLayersRef.current.markers) {
      overlayLayersRef.current.markers.clearLayers();

      locationRisks.forEach(({ location, weather, assessment }) => {
        const isSelected = location.id === selectedLocation.id;
        const riskCategory = assessment.riskCategory;

        let badgeBg = 'bg-emerald-500';
        let badgeBorder = 'border-emerald-400';
        let pulseBg = 'bg-emerald-400/30';

        if (riskCategory === 'VERY_HIGH' || riskCategory === 'EXTREME') {
          badgeBg = 'bg-rose-500';
          badgeBorder = 'border-rose-400';
          pulseBg = 'bg-rose-500/40';
        } else if (riskCategory === 'HIGH') {
          badgeBg = 'bg-orange-500';
          badgeBorder = 'border-orange-400';
          pulseBg = 'bg-orange-500/30';
        } else if (riskCategory === 'MODERATE') {
          badgeBg = 'bg-amber-500';
          badgeBorder = 'border-amber-400';
          pulseBg = 'bg-amber-500/30';
        }

        const markerHtml = `
          <div class="group relative cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-125">
            ${
              isSelected || riskCategory === 'VERY_HIGH'
                ? `<div class="absolute -inset-2.5 rounded-full ${pulseBg} animate-ping"></div>`
                : ''
            }
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${badgeBg} border-2 ${
          isSelected ? 'border-white ring-4 ring-cyan-400' : badgeBorder
        } shadow-xl shadow-black/60 text-white font-bold text-[11px]">
              <span>${Math.round(assessment.score)}</span>
            </div>
            <div class="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 rounded-md bg-slate-950/95 border border-slate-700/80 text-[10px] font-semibold text-white whitespace-nowrap shadow-lg pointer-events-none ${
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            } transition-opacity">
              ${location.name.split('(')[0].trim()}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-station-pin',
          html: markerHtml,
          iconSize: [0, 0],
        });

        const marker = L.marker([location.latitude, location.longitude], {
          icon: customIcon,
          zIndexOffset: isSelected ? 1000 : 100,
        });

        // Popup Content
        const popupContent = `
          <div class="p-3 bg-slate-950 text-slate-100 rounded-xl border border-slate-700 min-w-[240px] font-sans">
            <div class="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
              <div>
                <h4 class="font-bold text-sm text-white">${location.name}</h4>
                <p class="text-[11px] text-slate-400">${location.district}, ${location.state}</p>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                riskCategory === 'VERY_HIGH'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : riskCategory === 'HIGH'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  : riskCategory === 'MODERATE'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }">${riskCategory}</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-[11px] mb-3">
              <div class="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                <span class="text-slate-400 block text-[10px]">Landslide Risk</span>
                <span class="font-bold text-cyan-400">${Math.round(assessment.score)}% Prob.</span>
              </div>
              <div class="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                <span class="text-slate-400 block text-[10px]">24h Rainfall</span>
                <span class="font-bold text-blue-400">${weather.rainfallLast24h} mm</span>
              </div>
              <div class="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                <span class="text-slate-400 block text-[10px]">Slope Angle</span>
                <span class="font-bold text-amber-300">${location.slopeDegrees}° Steepness</span>
              </div>
              <div class="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                <span class="text-slate-400 block text-[10px]">Elevation</span>
                <span class="font-bold text-slate-300">${location.elevationMeters} m AMSL</span>
              </div>
            </div>

            <p class="text-[11px] text-slate-300 mb-3 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <strong class="text-cyan-400">Terrain:</strong> ${location.terrainType} &bull; 
              <strong class="text-amber-400">Soil:</strong> ${weather.soilSaturation}% Saturation
            </p>

            <button
              type="button"
              id="btn-select-station-${location.id}"
              class="w-full py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Focus This Station</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: 'custom-leaflet-popup',
          closeButton: false,
        });

        marker.on('popupopen', () => {
          setTimeout(() => {
            const btn = document.getElementById(`btn-select-station-${location.id}`);
            if (btn) {
              btn.onclick = () => {
                onSelectLocation(location);
                marker.closePopup();
              };
            }
          }, 50);
        });

        marker.addTo(overlayLayersRef.current.markers!);
      });
    }

    // 2. Critical Mountain Corridors (Highways)
    if (overlayLayersRef.current.highways) {
      overlayLayersRef.current.highways.clearLayers();
      if (showHighways) {
        MOUNTAIN_HIGHWAYS.forEach((hw) => {
          const polyline = L.polyline(hw.coordinates, {
            color: hw.color,
            weight: 4,
            opacity: 0.9,
            dashArray: '8, 6',
          });

          polyline.bindTooltip(
            `<strong>${hw.name}</strong><br/><span class="text-xs text-amber-300">${hw.status}</span>`,
            { sticky: true }
          );

          polyline.addTo(overlayLayersRef.current.highways!);
        });
      }
    }

    // 3. Landslide Hazard Escarpment Zones (GSI)
    if (overlayLayersRef.current.hazardZones) {
      overlayLayersRef.current.hazardZones.clearLayers();
      if (showHazardZones) {
        LANDSLIDE_HAZARD_ZONES.forEach((zone) => {
          const polygon = L.polygon(zone.coords, {
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.22,
            weight: 2,
            dashArray: '4, 4',
          });

          polygon.bindTooltip(
            `<strong>GSI Hazard Zone:</strong> ${zone.name}<br/><span class="text-xs text-rose-300 font-bold">${zone.level} Susceptibility</span>`,
            { sticky: true }
          );

          polygon.addTo(overlayLayersRef.current.hazardZones!);
        });
      }
    }

    // 4. Major River Basins
    if (overlayLayersRef.current.rivers) {
      overlayLayersRef.current.rivers.clearLayers();
      if (showRivers) {
        RIVER_NETWORKS.forEach((river) => {
          const riverLine = L.polyline(river.coords, {
            color: '#38bdf8',
            weight: 3.5,
            opacity: 0.85,
          });

          riverLine.bindTooltip(`<strong>Drainage Basin:</strong> ${river.name}`, {
            sticky: true,
          });

          riverLine.addTo(overlayLayersRef.current.rivers!);
        });
      }
    }

    // 5. Simulated Monsoon Precipitation Radar Layer
    if (overlayLayersRef.current.radar) {
      overlayLayersRef.current.radar.clearLayers();
      if (showRadar) {
        // Southern Meghalaya heavy convective storm core
        L.circle([25.30, 91.75], {
          radius: 35000,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.35,
          weight: 1,
        }).addTo(overlayLayersRef.current.radar);

        // Subansiri/Arunachal mountain inflow band
        L.circle([27.20, 93.80], {
          radius: 42000,
          color: '#f97316',
          fillColor: '#f97316',
          fillOpacity: 0.28,
          weight: 1,
        }).addTo(overlayLayersRef.current.radar);

        // Teesta Basin cloud belt
        L.circle([27.25, 88.55], {
          radius: 28000,
          color: '#eab308',
          fillColor: '#eab308',
          fillOpacity: 0.25,
          weight: 1,
        }).addTo(overlayLayersRef.current.radar);
      }
    }
  }, [leafletLib, locationRisks, selectedLocation, showHighways, showHazardZones, showRivers, showRadar, onSelectLocation]);

  // Smoothly Fly to Selected Location when changed from external props
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedLocation) return;

    map.flyTo([selectedLocation.latitude, selectedLocation.longitude], 12, {
      duration: 1.5,
    });
  }, [selectedLocation.id, selectedLocation.latitude, selectedLocation.longitude]);

  // View Presets Fly-To Handlers
  const handleFlyToPreset = (lat: number, lng: number, zoom: number) => {
    mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 1.4 });
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetNERView = () => {
    mapInstanceRef.current?.flyTo([26.2, 92.8], 7.5, { duration: 1.5 });
    if (overlayLayersRef.current.inspector) {
      overlayLayersRef.current.inspector.clearLayers();
      setInspectedPoint(null);
    }
  };

  return (
    <div className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4' : ''}`}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
        
        {/* Top Satellite Command Header Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  High-Resolution Satellite & Landslide Terrain Map
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
                  0.5m Optical Satellite
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sub-meter optical earth observation &bull; GSI landslide escarpments &bull; Active mountain corridors
              </p>
            </div>
          </div>

          {/* Quick Preset Geography Sectors */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            <span className="text-[11px] text-slate-500 font-medium mr-1">Quick Sectors:</span>
            <button
              type="button"
              id="btn-sector-shillong"
              onClick={() => handleFlyToPreset(25.40, 91.80, 11)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              ⛰️ Shillong/Sohra
            </button>
            <button
              type="button"
              id="btn-sector-sikkim"
              onClick={() => handleFlyToPreset(27.33, 88.55, 11)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              🏔️ Teesta/Gangtok
            </button>
            <button
              type="button"
              id="btn-sector-brahmaputra"
              onClick={() => handleFlyToPreset(26.18, 91.75, 10)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              🌊 Guwahati Basin
            </button>
            <button
              type="button"
              id="btn-sector-nagaland"
              onClick={() => handleFlyToPreset(25.68, 94.11, 11)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              🏞️ Kohima Ridge
            </button>
            <button
              type="button"
              id="btn-reset-ner-view"
              onClick={handleResetNERView}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset NER</span>
            </button>
          </div>
        </div>

        {/* Map Stage Container */}
        <div className="relative w-full h-[580px] md:h-[660px] bg-slate-950">
          
          {/* Leaflet Map Div */}
          <div
            ref={mapContainerRef}
            id="high-res-satellite-map-container"
            className="w-full h-full z-0"
            style={{ background: '#020617' }}
          />

          {/* Floating Map Layer Switcher (Top Right HUD) */}
          <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-1.5 shadow-2xl backdrop-blur-md flex items-center gap-1">
              <button
                type="button"
                id="btn-layer-satellite"
                onClick={() => setActiveLayer('satellite')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeLayer === 'satellite'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Satellite Optical
              </button>

              <button
                type="button"
                id="btn-layer-hybrid"
                onClick={() => setActiveLayer('hybrid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeLayer === 'hybrid'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Satellite Hybrid
              </button>

              <button
                type="button"
                id="btn-layer-topo"
                onClick={() => setActiveLayer('topo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeLayer === 'topo'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Topographic 3D
              </button>

              <button
                type="button"
                id="btn-layer-dark"
                onClick={() => setActiveLayer('dark')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeLayer === 'dark'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Dark Radar
              </button>

              <button
                type="button"
                id="btn-toggle-layer-drawer"
                onClick={() => setLayerDrawerOpen(!layerDrawerOpen)}
                className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                  layerDrawerOpen
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
                title="Geospatial Overlays"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>

            {/* Expanded Layer Drawer for Disaster Toggles */}
            {layerDrawerOpen && (
              <div className="bg-slate-950/95 border border-slate-700 rounded-xl p-3 shadow-2xl backdrop-blur-md w-64 space-y-2 text-xs">
                <div className="font-bold text-white flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span>Geospatial Overlays</span>
                  <span className="text-[10px] text-slate-400 font-mono">GSI & NDMA</span>
                </div>

                <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    Landslide Escarpments
                  </span>
                  <input
                    type="checkbox"
                    checked={showHazardZones}
                    onChange={(e) => setShowHazardZones(e.target.checked)}
                    className="accent-cyan-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    Mountain Corridors (NH-6/10/29)
                  </span>
                  <input
                    type="checkbox"
                    checked={showHighways}
                    onChange={(e) => setShowHighways(e.target.checked)}
                    className="accent-cyan-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                    River & Drainage Basins
                  </span>
                  <input
                    type="checkbox"
                    checked={showRivers}
                    onChange={(e) => setShowRivers(e.target.checked)}
                    className="accent-cyan-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                  <span className="flex items-center gap-2 text-slate-200">
                    <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                    Precipitation Radar Rings
                  </span>
                  <input
                    type="checkbox"
                    checked={showRadar}
                    onChange={(e) => setShowRadar(e.target.checked)}
                    className="accent-cyan-500 cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Floating Zoom & Fullscreen Controls (Left Bottom HUD) */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-1 shadow-2xl backdrop-blur-md flex flex-col gap-1">
              <button
                type="button"
                id="btn-map-zoom-in"
                onClick={handleZoomIn}
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center font-bold text-lg transition cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
              <button
                type="button"
                id="btn-map-zoom-out"
                onClick={handleZoomOut}
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center font-bold text-lg transition cursor-pointer"
                title="Zoom Out"
              >
                -
              </button>
              <button
                type="button"
                id="btn-toggle-fullscreen"
                onClick={() => {
                  setIsFullscreen(!isFullscreen);
                  setTimeout(() => mapInstanceRef.current?.invalidateSize(), 150);
                }}
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Real-time Telemetry HUD Tag */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-300 font-mono shadow-xl backdrop-blur-md">
              <span className="text-cyan-400 font-bold">LAT:</span> {mapCenterCoords.lat}°N &bull;{' '}
              <span className="text-cyan-400 font-bold">LON:</span> {mapCenterCoords.lng}°E &bull;{' '}
              <span className="text-amber-400 font-bold">Z:</span> {mapCenterCoords.zoom}
            </div>
          </div>

          {/* Interactive Click Inspector Floating Panel (Bottom Right) */}
          {inspectedPoint && (
            <div className="absolute bottom-4 right-4 z-20 max-w-xs p-3.5 rounded-xl bg-slate-950/95 border border-amber-500/40 shadow-2xl backdrop-blur-md text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Navigation className="w-4 h-4" />
                  <span>Custom Terrain Point</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInspectedPoint(null);
                    overlayLayersRef.current.inspector?.clearLayers();
                  }}
                  className="text-slate-400 hover:text-white text-sm font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] mb-2.5">
                <div>
                  <span className="text-slate-400 block text-[10px]">Coordinates</span>
                  <span className="font-mono font-medium text-slate-200">
                    {inspectedPoint.lat}°N, {inspectedPoint.lng}°E
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Est. Elevation</span>
                  <span className="font-bold text-cyan-400">{inspectedPoint.elevation} m</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Slope Angle</span>
                  <span className="font-bold text-amber-300">{inspectedPoint.estimatedSlope}° gradient</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Susceptibility</span>
                  <span className="font-bold text-rose-400">{inspectedPoint.susceptibility}</span>
                </div>
              </div>

              <button
                type="button"
                id="btn-apply-inspected-point"
                onClick={() => {
                  const customLocation: LocationData = {
                    id: `inspected-${Date.now()}`,
                    name: `Survey Point (${inspectedPoint.lat}°N, ${inspectedPoint.lng}°E)`,
                    district: 'Manual Satellite Point',
                    state: inspectedPoint.lat > 27 ? 'Arunachal Pradesh' : inspectedPoint.lat > 25 ? 'Meghalaya' : 'Assam',
                    latitude: inspectedPoint.lat,
                    longitude: inspectedPoint.lng,
                    elevationMeters: inspectedPoint.elevation,
                    slopeDegrees: inspectedPoint.estimatedSlope,
                    terrainType: inspectedPoint.estimatedSlope > 35 ? 'Steep Mountain' : 'Hilly Uplands',
                    historicalSusceptibility: inspectedPoint.susceptibility.includes('High') || inspectedPoint.susceptibility.includes('Extreme') ? 'High' : 'Moderate',
                    isCustomLocation: true,
                  };
                  onSelectLocation(customLocation);
                  setInspectedPoint(null);
                }}
                className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Set as Active Risk Location
              </button>
            </div>
          )}
        </div>

        {/* Map Legend & Geological Attribution Bar */}
        <div className="p-4 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300">Hazard Levels:</span>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-slate-300">Very High / Extreme (&gt;60%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-slate-300">High (41–60%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-slate-300">Moderate (21–40%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Low (&le;20%)</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-slate-400 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono">
              Imagery: Maxar/Airbus Earth Observation 0.5m
            </span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-slate-400">
              Click anywhere on satellite imagery to measure coordinates & slope
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
