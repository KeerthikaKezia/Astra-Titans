export type RiskCategory = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'EXTREME';

export interface LocationData {
  id: string;
  name: string;
  district: string;
  state: 'Assam' | 'Arunachal Pradesh' | 'Meghalaya' | 'Manipur' | 'Mizoram' | 'Nagaland' | 'Tripura' | 'Sikkim';
  latitude: number;
  longitude: number;
  elevationMeters: number;
  slopeDegrees: number;
  terrainType: 'Steep Mountain' | 'Hilly Uplands' | 'Valley/Foothills' | 'Floodplain' | 'Plateau';
  historicalSusceptibility: 'Low' | 'Moderate' | 'High' | 'Very High';
  nearbyRivers?: string[];
  isCustomLocation?: boolean;
}

export interface WeatherData {
  temperatureC: number;
  condition: string;
  conditionIcon: string;
  rainfallLast1hMm: number;
  rainfallLast6hMm: number;
  rainfallLast24hMm: number;
  rainfallCumulativeMm: number;
  rainfallForecast24hMm: number;
  humidityPercent: number;
  windSpeedKmh: number;
  pressureHpa: number;
  soilSaturationPercent: number;
  hourlyForecast: Array<{
    time: string;
    temperatureC: number;
    rainfallMm: number;
    humidity: number;
    windKmh: number;
    estimatedRisk: number;
  }>;
  dailyForecast: Array<{
    day: string;
    condition: string;
    maxTempC: number;
    minTempC: number;
    rainfallMm: number;
    riskCategory: RiskCategory;
  }>;
}

export interface FactorBreakdown {
  name: string;
  score: number; // 0 - 100
  weight: number; // percentage
  impact: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  description: string;
}

export interface HazardRisk {
  hazardType: string;
  score: number; // 0 - 100
  category: RiskCategory;
  confidence: number; // percentage 0 - 100
  mainContributingFactors: string[];
  recommendedActions: string[];
  breakdown?: FactorBreakdown[];
}

export interface LandslideAssessment {
  score: number;
  category: RiskCategory;
  confidence: number;
  rainfallFactor: number;
  rainfallIntensityFactor: number;
  slopeFactor: number;
  soilSaturationFactor: number;
  terrainFactor: number;
  historicalFactor: number;
  factors: FactorBreakdown[];
  thresholds: {
    last1h: { value: number; threshold: number; breached: boolean };
    last6h: { value: number; threshold: number; breached: boolean };
    last24h: { value: number; threshold: number; breached: boolean };
    forecast: { value: number; threshold: number; breached: boolean };
  };
  explanation: string;
  whyPoints: string[];
  recommendedActions: string[];
}

export interface TimelineEntry {
  label: string;
  timeOffset: string;
  landslideRisk: number;
  floodRisk: number;
  rainfallMm: number;
  status: 'past' | 'current' | 'forecast';
}

export interface EarlyWarningAlert {
  id: string;
  severity: RiskCategory;
  location: string;
  state: string;
  district: string;
  time: string;
  hazard: string;
  reason: string;
  recommendedAction: string;
  isAcknowledged?: boolean;
}

export interface NERStateData {
  state: 'Assam' | 'Arunachal Pradesh' | 'Meghalaya' | 'Manipur' | 'Mizoram' | 'Nagaland' | 'Tripura' | 'Sikkim';
  capital: string;
  overallRisk: RiskCategory;
  landslideRisk: RiskCategory;
  floodRisk: RiskCategory;
  rainfallStatus: 'Normal' | 'Moderate' | 'Heavy' | 'Very Heavy' | 'Extremely Heavy';
  avgRainfall24hMm: number;
  activeAlertsCount: number;
  highRiskDistricts: string[];
  keyVulnerabilities: string;
}

export interface DisasterPredictionResult {
  location: LocationData;
  weather: WeatherData;
  overallRisk: {
    score: number;
    category: RiskCategory;
    confidence: number;
  };
  landslideRisk: LandslideAssessment;
  floodRisk: HazardRisk;
  flashFloodRisk: HazardRisk;
  heavyRainfallRisk: HazardRisk;
  lightningRisk: HazardRisk;
  cycloneRisk: HazardRisk;
  extremeWeatherRisk: HazardRisk;
  contributingFactors: string[];
  whyExplanation: string[];
  whatShouldYouDo: string[];
  timeline: TimelineEntry[];
  isAiGenerated: boolean;
  timestamp: string;
}
