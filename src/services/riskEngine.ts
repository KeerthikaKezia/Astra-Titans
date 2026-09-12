import {
  LocationData,
  WeatherData,
  RiskCategory,
  LandslideAssessment,
  HazardRisk,
  DisasterPredictionResult,
  TimelineEntry,
  FactorBreakdown,
} from '../types';

export function getRiskCategory(score: number): RiskCategory {
  if (score <= 20) return 'LOW';
  if (score <= 40) return 'MODERATE';
  if (score <= 60) return 'HIGH';
  if (score <= 80) return 'VERY_HIGH';
  return 'EXTREME';
}

export function getRiskColorClass(category: RiskCategory): {
  badge: string;
  border: string;
  bg: string;
  text: string;
  fill: string;
} {
  switch (category) {
    case 'LOW':
      return {
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-950/30',
        text: 'text-emerald-400',
        fill: '#10b981',
      };
    case 'MODERATE':
      return {
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        border: 'border-amber-500/40',
        bg: 'bg-amber-950/30',
        text: 'text-amber-300',
        fill: '#f59e0b',
      };
    case 'HIGH':
      return {
        badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        border: 'border-orange-500/40',
        bg: 'bg-orange-950/30',
        text: 'text-orange-400',
        fill: '#f97316',
      };
    case 'VERY_HIGH':
      return {
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        border: 'border-rose-500/40',
        bg: 'bg-rose-950/30',
        text: 'text-rose-400',
        fill: '#f43f5e',
      };
    case 'EXTREME':
      return {
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        border: 'border-purple-500/50',
        bg: 'bg-purple-950/40',
        text: 'text-purple-300',
        fill: '#a855f7',
      };
  }
}

/**
 * Calculates the explainable prototype Landslide Risk Model
 * Score formula:
 * Landslide Risk Score =
 *   Rainfall Factor (25%) +
 *   Rainfall Intensity Factor (20%) +
 *   Slope Factor (25%) +
 *   Soil Saturation Factor (15%) +
 *   Terrain Factor (10%) +
 *   Historical Susceptibility Factor (5%)
 * Result normalized to 0 - 100
 */
export function calculateLandslideRisk(
  location: LocationData,
  weather: WeatherData
): LandslideAssessment {
  // 1. Rainfall Factor (0 - 100): based on 24h cumulative rainfall
  // For NE India hill slopes, >100mm in 24h is dangerous, >150mm is critical
  const rainfallFactor = Math.min(100, (weather.rainfallLast24hMm / 140) * 100);

  // 2. Rainfall Intensity Factor (0 - 100): based on 1-hour & 6-hour burst
  // Burst rate >20mm/hr or >50mm in 6h causes pore water pressure spikes
  const intensity1h = (weather.rainfallLast1hMm / 22) * 60;
  const intensity6h = (weather.rainfallLast6hMm / 55) * 40;
  const rainfallIntensityFactor = Math.min(100, intensity1h + intensity6h);

  // 3. Slope Factor (0 - 100): based on slope degrees
  // Slopes between 30° - 50° have the highest risk of debris slides and planar failures
  let slopeFactor = 0;
  if (location.slopeDegrees < 10) {
    slopeFactor = 15;
  } else if (location.slopeDegrees < 25) {
    slopeFactor = 40;
  } else if (location.slopeDegrees < 35) {
    slopeFactor = 75;
  } else if (location.slopeDegrees <= 50) {
    slopeFactor = 95;
  } else {
    // Very steep rock cliffs often lose regolith so may have rockfall risk
    slopeFactor = 85;
  }

  // 4. Soil Saturation Factor (0 - 100)
  const soilSaturationFactor = Math.min(100, weather.soilSaturationPercent);

  // 5. Terrain Factor (0 - 100)
  let terrainFactor = 40;
  switch (location.terrainType) {
    case 'Steep Mountain':
      terrainFactor = 95;
      break;
    case 'Hilly Uplands':
      terrainFactor = 70;
      break;
    case 'Plateau':
      terrainFactor = 65;
      break;
    case 'Valley/Foothills':
      terrainFactor = 45;
      break;
    case 'Floodplain':
      terrainFactor = 15;
      break;
  }

  // 6. Historical Susceptibility (0 - 100)
  let historicalFactor = 30;
  switch (location.historicalSusceptibility) {
    case 'Very High':
      historicalFactor = 95;
      break;
    case 'High':
      historicalFactor = 75;
      break;
    case 'Moderate':
      historicalFactor = 45;
      break;
    case 'Low':
      historicalFactor = 20;
      break;
  }

  // Weighted sum
  const weightedScore =
    rainfallFactor * 0.25 +
    rainfallIntensityFactor * 0.20 +
    slopeFactor * 0.25 +
    soilSaturationFactor * 0.15 +
    terrainFactor * 0.10 +
    historicalFactor * 0.05;

  const finalScore = Math.round(Math.min(100, Math.max(0, weightedScore)));
  const category = getRiskCategory(finalScore);

  // Confidence calculation: based on weather coverage and terrain resolution
  let confidence = 84;
  if (weather.rainfallLast24hMm > 0 && weather.soilSaturationPercent > 0) {
    confidence = 88;
  }

  const factors: FactorBreakdown[] = [
    {
      name: '24h Cumulative Rainfall',
      score: Math.round(rainfallFactor),
      weight: 25,
      impact: rainfallFactor > 70 ? 'CRITICAL' : rainfallFactor > 40 ? 'HIGH' : 'MODERATE',
      description: `${weather.rainfallLast24hMm.toFixed(1)} mm accumulated over the last 24 hours.`,
    },
    {
      name: 'Rainfall Burst & Intensity',
      score: Math.round(rainfallIntensityFactor),
      weight: 20,
      impact: rainfallIntensityFactor > 70 ? 'CRITICAL' : rainfallIntensityFactor > 40 ? 'HIGH' : 'MODERATE',
      description: `Short-term rate: ${weather.rainfallLast1hMm.toFixed(1)} mm/hr (6h sum: ${weather.rainfallLast6hMm.toFixed(1)} mm).`,
    },
    {
      name: 'Terrain Slope Angle',
      score: Math.round(slopeFactor),
      weight: 25,
      impact: slopeFactor > 70 ? 'HIGH' : slopeFactor > 40 ? 'MODERATE' : 'LOW',
      description: `Steepness: ${location.slopeDegrees}° gradient on ${location.terrainType}.`,
    },
    {
      name: 'Subsurface Soil Saturation',
      score: Math.round(soilSaturationFactor),
      weight: 15,
      impact: soilSaturationFactor > 80 ? 'CRITICAL' : soilSaturationFactor > 60 ? 'HIGH' : 'MODERATE',
      description: `Soil moisture retention at estimated ${weather.soilSaturationPercent}% capacity.`,
    },
    {
      name: 'Geomorphology & Elevation',
      score: Math.round(terrainFactor),
      weight: 10,
      impact: terrainFactor > 70 ? 'HIGH' : 'MODERATE',
      description: `Elevation: ${location.elevationMeters}m AMSL in fragile North-East Himalayan strata.`,
    },
    {
      name: 'Historical Landslide Index',
      score: Math.round(historicalFactor),
      weight: 5,
      impact: historicalFactor > 70 ? 'HIGH' : 'LOW',
      description: `Prior Geological Survey of India (GSI) landslide inventory rating: ${location.historicalSusceptibility}.`,
    },
  ];

  // Rainfall threshold triggers
  const thresholds = {
    last1h: {
      value: weather.rainfallLast1hMm,
      threshold: 15.0,
      breached: weather.rainfallLast1hMm >= 15.0,
    },
    last6h: {
      value: weather.rainfallLast6hMm,
      threshold: 45.0,
      breached: weather.rainfallLast6hMm >= 45.0,
    },
    last24h: {
      value: weather.rainfallLast24hMm,
      threshold: 90.0,
      breached: weather.rainfallLast24hMm >= 90.0,
    },
    forecast: {
      value: weather.rainfallForecast24hMm,
      threshold: 60.0,
      breached: weather.rainfallForecast24hMm >= 60.0,
    },
  };

  // Natural language explanations
  const whyPoints: string[] = [];
  if (weather.rainfallLast24hMm >= 75) {
    whyPoints.push(`Heavy rainfall detected (${weather.rainfallLast24hMm.toFixed(0)} mm in 24 hours), causing shear stress in upper soil horizons.`);
  } else if (weather.rainfallLast24hMm >= 30) {
    whyPoints.push(`Moderate persistent rainfall (${weather.rainfallLast24hMm.toFixed(0)} mm in 24 hours) steadily reducing cohesion.`);
  } else {
    whyPoints.push(`Mild rainfall conditions (${weather.rainfallLast24hMm.toFixed(0)} mm in 24 hours).`);
  }

  if (location.slopeDegrees >= 35) {
    whyPoints.push(`Steep topography (${location.slopeDegrees}° angle) creates elevated gravitational pull on regolith layers.`);
  } else if (location.slopeDegrees >= 20) {
    whyPoints.push(`Moderate hill gradient (${location.slopeDegrees}° angle) prone to planar slippage under runoff.`);
  }

  if (weather.soilSaturationPercent >= 75) {
    whyPoints.push(`High soil saturation (${weather.soilSaturationPercent}%) creates positive pore water pressure, triggering mudflows.`);
  }

  if (weather.rainfallForecast24hMm >= 40) {
    whyPoints.push(`Additional heavy precipitation (${weather.rainfallForecast24hMm.toFixed(0)} mm forecast) will exacerbate slope instability.`);
  }

  if (location.historicalSusceptibility === 'Very High' || location.historicalSusceptibility === 'High') {
    whyPoints.push(`Location falls in a documented historical landslide hazard zone (${location.historicalSusceptibility} susceptibility index).`);
  }

  const recommendedActions: string[] = [];
  if (finalScore >= 61) {
    recommendedActions.push('Avoid travelling through steep mountain passes, cut slopes, and canyon highway segments.');
    recommendedActions.push('Stay well away from unstable slopes, retaining walls showing fresh cracks, or leaning poles/trees.');
    recommendedActions.push('Monitor official District Disaster Management Authority (DDMA) and IMD bulletins closely.');
    recommendedActions.push('Residents in toe-of-slope structures should relocate to designated relief camps or higher stable ground.');
    recommendedActions.push('Keep emergency battery, essential medications, and waterproof document kit ready.');
  } else if (finalScore >= 35) {
    recommendedActions.push('Exercise caution along hill roads prone to debris fall and culvert blockages.');
    recommendedActions.push('Clear blocked storm drains and drainage channels around uphill compounds.');
    recommendedActions.push('Keep emergency radio/phone charged and watch for rapid water runoff discoloration.');
    recommendedActions.push('Follow local administration advisories and report slope shifts to the disaster helpline (1070/112).');
  } else {
    recommendedActions.push('Maintain standard hill driving precautions during rain showers.');
    recommendedActions.push('Keep household storm gutters unblocked.');
    recommendedActions.push('Check weather updates before undertaking long-distance inter-state hill travel.');
  }

  const explanation = `Estimated landslide risk is ${category} (${finalScore}/100) because ${location.name} exhibits ${
    weather.rainfallLast24hMm > 50 ? 'significant rainfall' : 'current precipitation'
  } combined with ${location.slopeDegrees}° slope steepness and ${weather.soilSaturationPercent}% subsurface soil saturation.`;

  return {
    score: finalScore,
    category,
    confidence,
    rainfallFactor: Math.round(rainfallFactor),
    rainfallIntensityFactor: Math.round(rainfallIntensityFactor),
    slopeFactor: Math.round(slopeFactor),
    soilSaturationFactor: Math.round(soilSaturationFactor),
    terrainFactor: Math.round(terrainFactor),
    historicalFactor: Math.round(historicalFactor),
    factors,
    thresholds,
    explanation,
    whyPoints,
    recommendedActions,
  };
}

/**
 * Calculates Flood Risk
 */
export function calculateFloodRisk(location: LocationData, weather: WeatherData): HazardRisk {
  // Low elevation + heavy rainfall + nearby rivers = higher flood risk
  const elevationFactor = Math.max(0, 100 - (location.elevationMeters / 300) * 100);
  const rainFactor = Math.min(100, (weather.rainfallLast24hMm / 130) * 100);
  const riverFactor = location.nearbyRivers && location.nearbyRivers.length > 0 ? 80 : 30;
  const flatFactor = location.slopeDegrees < 12 ? 85 : 25;

  const score = Math.round(
    rainFactor * 0.40 +
    elevationFactor * 0.25 +
    riverFactor * 0.20 +
    flatFactor * 0.15
  );

  const category = getRiskCategory(score);

  return {
    hazardType: 'Flood',
    score,
    category,
    confidence: 85,
    mainContributingFactors: [
      `Rainfall accumulation: ${weather.rainfallLast24hMm.toFixed(0)} mm in 24h`,
      `Catchment drainage: ${location.nearbyRivers?.join(', ') || 'Local watershed basin'}`,
      `Basin elevation: ${location.elevationMeters}m AMSL with ${location.slopeDegrees}° gradient`,
    ],
    recommendedActions: [
      'Avoid crossing submerged causeways, low bridges, and overflowing drainage culverts.',
      'Move livestock, vehicles, and critical assets to elevated platforms.',
      'Keep safe drinking water stored; water pipelines can suffer contamination during inundation.',
    ],
  };
}

/**
 * Calculates Flash Flood Risk
 */
export function calculateFlashFloodRisk(location: LocationData, weather: WeatherData): HazardRisk {
  // Intense bursts in mountain valleys cause sudden torrents
  const intensityFactor = Math.min(100, (weather.rainfallLast1hMm / 20) * 60 + (weather.rainfallLast6hMm / 50) * 40);
  const ravineFactor = location.terrainType === 'Steep Mountain' || location.terrainType === 'Valley/Foothills' ? 75 : 30;
  const score = Math.round(intensityFactor * 0.65 + ravineFactor * 0.35);
  const category = getRiskCategory(score);

  return {
    hazardType: 'Flash Flood',
    score,
    category,
    confidence: 82,
    mainContributingFactors: [
      `Intense burst rate: ${weather.rainfallLast1hMm.toFixed(1)} mm/hr`,
      `Gorge/ravine run-off velocity in ${location.terrainType}`,
    ],
    recommendedActions: [
      'Do not camp, park, or walk near mountain riverbeds or dry nullahs.',
      'Heed upstream cloudburst alerts and move immediately to higher banks.',
    ],
  };
}

/**
 * Calculates Heavy Rainfall Risk
 */
export function calculateHeavyRainRisk(weather: WeatherData): HazardRisk {
  // IMD scale: 64.5 - 115.5 mm = Heavy, 115.6 - 204.4 mm = Very Heavy, >204.4 mm = Extremely Heavy
  const rate = weather.rainfallLast24hMm + weather.rainfallForecast24hMm * 0.5;
  const score = Math.round(Math.min(100, (rate / 150) * 100));
  const category = getRiskCategory(score);

  return {
    hazardType: 'Heavy Rainfall',
    score,
    category,
    confidence: 90,
    mainContributingFactors: [
      `24h observed: ${weather.rainfallLast24hMm.toFixed(1)} mm`,
      `Next 24h forecast: ${weather.rainfallForecast24hMm.toFixed(1)} mm`,
      `Atmospheric moisture: ${weather.humidityPercent}% humidity`,
    ],
    recommendedActions: [
      'Expect severe visibility reductions and waterlogged roads.',
      'Check local drainage grates and clear perimeter vegetation.',
    ],
  };
}

/**
 * Calculates Lightning / Thunderstorm Risk
 */
export function calculateLightningRisk(weather: WeatherData): HazardRisk {
  // High humidity + warm temperatures + pressure drops create convective cells
  let score = 20;
  if (weather.humidityPercent > 80 && weather.temperatureC > 22 && weather.rainfallLast1hMm > 5) {
    score = 75;
  } else if (weather.humidityPercent > 70 && weather.rainfallLast1hMm > 2) {
    score = 52;
  } else if (weather.rainfallLast1hMm > 0) {
    score = 35;
  }
  const category = getRiskCategory(score);

  return {
    hazardType: 'Lightning & Thunderstorm',
    score,
    category,
    confidence: 80,
    mainContributingFactors: [
      `Convective moisture index: ${weather.humidityPercent}%`,
      `Wind speed: ${weather.windSpeedKmh} km/h with localized shear`,
    ],
    recommendedActions: [
      'Seek sturdy indoor shelter; avoid open fields, solitary tall trees, and metal masts.',
      'Unplug sensitive electrical devices and avoid open water bodies.',
    ],
  };
}

/**
 * Calculates Cyclone / Severe Storm Risk
 */
export function calculateCycloneRisk(location: LocationData, weather: WeatherData): HazardRisk {
  // Cyclone influence in NE is mainly Bay of Bengal depressions bringing wind gusts & deluges
  let score = Math.round((weather.windSpeedKmh / 90) * 60 + (weather.rainfallLast24hMm / 150) * 40);
  score = Math.min(100, Math.max(10, score));
  const category = getRiskCategory(score);

  return {
    hazardType: 'Severe Storm & Gale Wind',
    score,
    category,
    confidence: 84,
    mainContributingFactors: [
      `Sustained wind velocity: ${weather.windSpeedKmh} km/h`,
      `Barometric pressure: ${weather.pressureHpa} hPa`,
    ],
    recommendedActions: [
      'Secure loose rooftop corrugated tin sheets and solar panels.',
      'Trim overhanging tree branches close to power lines.',
    ],
  };
}

/**
 * Calculates Extreme Weather Hazard
 */
export function calculateExtremeWeatherRisk(weather: WeatherData): HazardRisk {
  const score = Math.round(
    Math.min(100, (weather.rainfallLast24hMm / 150) * 50 + (weather.windSpeedKmh / 80) * 30 + (weather.humidityPercent / 100) * 20)
  );
  const category = getRiskCategory(score);

  return {
    hazardType: 'Extreme Weather',
    score,
    category,
    confidence: 86,
    mainContributingFactors: [
      `Multi-parameter convergence of wind, rain, and soil saturation`,
      `Compound risk rating: ${category}`,
    ],
    recommendedActions: [
      'Keep emergency radio tuned to All India Radio / Doordarshan disaster bulletins.',
      'Limit non-essential travel until meteorological clearance is issued.',
    ],
  };
}

/**
 * Generates the past -> current -> forecast risk timeline
 */
export function generateRiskTimeline(
  currentLandslideScore: number,
  currentFloodScore: number,
  weather: WeatherData
): TimelineEntry[] {
  return [
    {
      label: '12 hours ago',
      timeOffset: '-12h',
      landslideRisk: Math.max(15, Math.round(currentLandslideScore * 0.65)),
      floodRisk: Math.max(10, Math.round(currentFloodScore * 0.60)),
      rainfallMm: Math.round(weather.rainfallLast24hMm * 0.35),
      status: 'past',
    },
    {
      label: '6 hours ago',
      timeOffset: '-6h',
      landslideRisk: Math.max(20, Math.round(currentLandslideScore * 0.82)),
      floodRisk: Math.max(15, Math.round(currentFloodScore * 0.80)),
      rainfallMm: Math.round(weather.rainfallLast6hMm * 0.7),
      status: 'past',
    },
    {
      label: 'Now',
      timeOffset: '0h',
      landslideRisk: currentLandslideScore,
      floodRisk: currentFloodScore,
      rainfallMm: Math.round(weather.rainfallLast1hMm),
      status: 'current',
    },
    {
      label: '+6 hours',
      timeOffset: '+6h',
      landslideRisk: Math.min(100, Math.round(currentLandslideScore * 1.08 + (weather.rainfallForecast24hMm > 50 ? 6 : -3))),
      floodRisk: Math.min(100, Math.round(currentFloodScore * 1.05)),
      rainfallMm: Math.round(weather.rainfallForecast24hMm * 0.25),
      status: 'forecast',
    },
    {
      label: '+12 hours',
      timeOffset: '+12h',
      landslideRisk: Math.min(100, Math.round(currentLandslideScore * 1.02 + (weather.rainfallForecast24hMm > 70 ? 8 : -5))),
      floodRisk: Math.min(100, Math.round(currentFloodScore * 1.10)),
      rainfallMm: Math.round(weather.rainfallForecast24hMm * 0.45),
      status: 'forecast',
    },
    {
      label: '+24 hours',
      timeOffset: '+24h',
      landslideRisk: Math.max(20, Math.min(100, Math.round(currentLandslideScore * 0.88))),
      floodRisk: Math.max(15, Math.min(100, Math.round(currentFloodScore * 0.95))),
      rainfallMm: Math.round(weather.rainfallForecast24hMm * 0.8),
      status: 'forecast',
    },
  ];
}

/**
 * Synthesizes the overall disaster prediction output
 */
export function runDisasterPredictionEngine(
  location: LocationData,
  weather: WeatherData
): DisasterPredictionResult {
  const landslide = calculateLandslideRisk(location, weather);
  const flood = calculateFloodRisk(location, weather);
  const flashFlood = calculateFlashFloodRisk(location, weather);
  const heavyRain = calculateHeavyRainRisk(weather);
  const lightning = calculateLightningRisk(weather);
  const cyclone = calculateCycloneRisk(location, weather);
  const extremeWeather = calculateExtremeWeatherRisk(weather);

  // Overall risk is heavily weighted towards the maximum hazard
  const maxHazardScore = Math.max(
    landslide.score,
    flood.score,
    flashFlood.score,
    heavyRain.score
  );
  const meanScore = (landslide.score + flood.score + flashFlood.score + heavyRain.score) / 4;
  const overallScore = Math.round(maxHazardScore * 0.7 + meanScore * 0.3);
  const overallCategory = getRiskCategory(overallScore);

  const timeline = generateRiskTimeline(landslide.score, flood.score, weather);

  const contributingFactors: string[] = [
    `Landslide susceptibility: ${landslide.category} (${landslide.score}/100) on ${location.slopeDegrees}° terrain`,
    `24h rainfall: ${weather.rainfallLast24hMm.toFixed(1)} mm with ${weather.soilSaturationPercent}% soil moisture`,
    `Riverine & Flash flood rating: ${flood.category} (${flood.score}/100)`,
    `Atmospheric convection & wind: ${weather.windSpeedKmh} km/h, ${weather.humidityPercent}% humidity`,
  ];

  return {
    location,
    weather,
    overallRisk: {
      score: overallScore,
      category: overallCategory,
      confidence: 86,
    },
    landslideRisk: landslide,
    floodRisk: flood,
    flashFloodRisk: flashFlood,
    heavyRainfallRisk: heavyRain,
    lightningRisk: lightning,
    cycloneRisk: cyclone,
    extremeWeatherRisk: extremeWeather,
    contributingFactors,
    whyExplanation: landslide.whyPoints,
    whatShouldYouDo: landslide.recommendedActions,
    timeline,
    isAiGenerated: false,
    timestamp: new Date().toISOString(),
  };
}
