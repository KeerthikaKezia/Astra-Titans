import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroLocationSelector } from './components/HeroLocationSelector';
import { RiskOverviewCards } from './components/RiskOverviewCards';
import { LandslideMonitor } from './components/LandslideMonitor';
import { InteractiveRiskMap } from './components/InteractiveRiskMap';
import { WeatherRiskCorrelation } from './components/WeatherRiskCorrelation';
import { AlertSystem } from './components/AlertSystem';
import { RiskTimeline } from './components/RiskTimeline';
import { StateRiskTable } from './components/StateRiskTable';
import { AnalyticsPage } from './components/AnalyticsPage';
import { EmergencyPreparedness } from './components/EmergencyPreparedness';
import { HazardDetailModal } from './components/HazardDetailModal';
import { Footer } from './components/Footer';

import { LocationData, WeatherData, DisasterPredictionResult, EarlyWarningAlert } from './types';
import { NER_LOCATIONS, INITIAL_ALERTS } from './data/nerStates';
import { fetchWeatherData, getDemoWeatherData } from './services/weatherService';
import { runDisasterPredictionEngine } from './services/riskEngine';
import { requestDisasterAnalysis } from './services/aiService';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data State
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(NER_LOCATIONS[0]); // Shillong
  const [weather, setWeather] = useState<WeatherData>(() => getDemoWeatherData(NER_LOCATIONS[0]));

  const [prediction, setPrediction] = useState<DisasterPredictionResult>(() => {
    const initWeather = getDemoWeatherData(NER_LOCATIONS[0]);
    return runDisasterPredictionEngine(NER_LOCATIONS[0], initWeather);
  });

  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>(INITIAL_ALERTS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLiveWeather, setIsLiveWeather] = useState(false);
  const [dataSource, setDataSource] = useState('High-Fidelity Regional Calibration');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalHazardType, setModalHazardType] = useState<string | null>(null);
  const [modalAlert, setModalAlert] = useState<EarlyWarningAlert | null>(null);

  // Load weather & prediction when location changes
  const loadLocationData = useCallback(async (loc: LocationData) => {
    setIsAnalyzing(true);
    try {
      const weatherResult = await fetchWeatherData(loc, false);
      setWeather(weatherResult.weather);
      setIsLiveWeather(weatherResult.isLive);
      setDataSource(weatherResult.dataSource);

      // Analyze risk with AI or Risk Engine
      const aiResponse = await requestDisasterAnalysis(loc, weatherResult.weather, false);
      setPrediction(aiResponse.result);
    } catch (err) {
      console.error('Error updating location data:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadLocationData(selectedLocation);
  }, []);

  // Handler for selecting a new location
  const handleSelectLocation = (newLoc: LocationData) => {
    setSelectedLocation(newLoc);
    loadLocationData(newLoc);
  };

  // Handler for custom manual coordinate selection
  const handleCustomCoordinates = (lat: number, lon: number, name: string) => {
    const customLoc: LocationData = {
      id: `custom-${Date.now()}`,
      name: `${name} (User Defined)`,
      district: 'Manual Inspection Zone',
      state: 'Assam',
      latitude: lat,
      longitude: lon,
      elevationMeters: 850,
      slopeDegrees: 34,
      terrainType: 'Steep Mountain',
      historicalSusceptibility: 'High',
      isCustomLocation: true,
      nearbyRivers: ['Brahmaputra Tributary'],
    };
    setSelectedLocation(customLoc);
    loadLocationData(customLoc);
  };

  // Re-analyze conditions button
  const handleAnalyzeConditions = async () => {
    setIsAnalyzing(true);
    try {
      const aiResponse = await requestDisasterAnalysis(selectedLocation, weather, false);
      setPrediction(aiResponse.result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Alert actions
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isAcknowledged: true } : a))
    );
  };

  const handleOpenAlertModal = (alert: EarlyWarningAlert) => {
    setModalAlert(alert);
    setModalHazardType(alert.hazard);
    setIsModalOpen(true);
  };

  const handleOpenHazardModal = (hazardKey: string) => {
    setModalAlert(null);
    setModalHazardType(hazardKey);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={alerts.filter((a) => !a.isAcknowledged).length}
        currentLocation={selectedLocation}
      />

      {/* Main Content Areas based on Active Tab */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Hero & Location Selector */}
            <HeroLocationSelector
              selectedLocation={selectedLocation}
              currentLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              onCustomLocation={handleCustomCoordinates}
              onAnalyze={handleAnalyzeConditions}
              isAnalyzing={isAnalyzing}
              onOpenMap={() => setActiveTab('map')}
              isLive={isLiveWeather}
            />

            {/* 4 Prominent Dynamic Risk Overview Cards */}
            <RiskOverviewCards
              prediction={prediction}
              onSelectHazard={handleOpenHazardModal}
            />

            {/* Flagship Landslide Risk Monitor Component */}
            <LandslideMonitor
              assessment={prediction.landslideRisk}
              location={selectedLocation}
              weather={weather}
            />

            {/* Interactive Risk Map Preview */}
            <InteractiveRiskMap
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              isDemoMode={!isLiveWeather}
            />

            {/* Weather Telemetry & Correlation */}
            <WeatherRiskCorrelation
              weather={weather}
              location={selectedLocation}
              landslideAssessment={prediction.landslideRisk}
              onAnalyze={handleAnalyzeConditions}
              isAnalyzing={isAnalyzing}
              isLive={isLiveWeather}
              dataSource={dataSource}
            />

            {/* Temporal Risk Timeline */}
            <RiskTimeline
              timeline={prediction.timeline}
              locationName={selectedLocation.name}
            />

            {/* Early Warning Alerts Section */}
            <AlertSystem
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onViewDetails={handleOpenAlertModal}
            />

            {/* State-wise Monitoring Grid */}
            <StateRiskTable onSelectLocation={handleSelectLocation} />
          </div>
        )}

        {activeTab === 'landslide' && (
          <div className="py-6 space-y-6">
            <HeroLocationSelector
              selectedLocation={selectedLocation}
              currentLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              onCustomLocation={handleCustomCoordinates}
              onAnalyze={handleAnalyzeConditions}
              isAnalyzing={isAnalyzing}
              onOpenMap={() => setActiveTab('map')}
              isLive={isLiveWeather}
            />
            <LandslideMonitor
              assessment={prediction.landslideRisk}
              location={selectedLocation}
              weather={weather}
            />
            <RiskTimeline
              timeline={prediction.timeline}
              locationName={selectedLocation.name}
            />
          </div>
        )}

        {activeTab === 'map' && (
          <div className="py-6 space-y-6">
            <InteractiveRiskMap
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              isDemoMode={!isLiveWeather}
            />
            <RiskOverviewCards
              prediction={prediction}
              onSelectHazard={handleOpenHazardModal}
            />
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="py-6 space-y-6">
            <WeatherRiskCorrelation
              weather={weather}
              location={selectedLocation}
              landslideAssessment={prediction.landslideRisk}
              onAnalyze={handleAnalyzeConditions}
              isAnalyzing={isAnalyzing}
              isLive={isLiveWeather}
              dataSource={dataSource}
            />
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="py-6 space-y-6">
            <AlertSystem
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onViewDetails={handleOpenAlertModal}
            />
          </div>
        )}

        {activeTab === 'states' && (
          <div className="py-6 space-y-6">
            <StateRiskTable onSelectLocation={handleSelectLocation} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="py-6 space-y-6">
            <AnalyticsPage onSelectLocation={handleSelectLocation} />
          </div>
        )}

        {activeTab === 'preparedness' && (
          <div className="py-6 space-y-6">
            <EmergencyPreparedness />
          </div>
        )}
      </main>

      {/* Hazard Forensic Detail Modal */}
      <HazardDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        hazardType={modalHazardType}
        prediction={prediction}
        selectedAlert={modalAlert}
      />

      {/* Application Footer */}
      <Footer />
    </div>
  );
}
