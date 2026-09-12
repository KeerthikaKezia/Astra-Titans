import {
  LocationData,
  WeatherData,
  DisasterPredictionResult,
} from '../types';
import { runDisasterPredictionEngine } from './riskEngine';

export async function requestDisasterAnalysis(
  location: LocationData,
  weather: WeatherData,
  isDemoMode: boolean
): Promise<{ result: DisasterPredictionResult; isAiAssisted: boolean; providerMessage?: string }> {
  // Always calculate deterministic baseline first
  const deterministicResult = runDisasterPredictionEngine(location, weather);

  if (isDemoMode) {
    return {
      result: { ...deterministicResult, isAiGenerated: false },
      isAiAssisted: false,
      providerMessage: 'Demo Mode: Deterministic Geospatial Risk Engine',
    };
  }

  try {
    const payload = {
      location: location.name,
      district: location.district,
      state: location.state,
      latitude: location.latitude,
      longitude: location.longitude,
      rainfallLast1h: weather.rainfallLast1hMm,
      rainfallLast6h: weather.rainfallLast6hMm,
      rainfallLast24h: weather.rainfallLast24hMm,
      rainfallForecast24h: weather.rainfallForecast24hMm,
      humidity: weather.humidityPercent,
      temperature: weather.temperatureC,
      windSpeed: weather.windSpeedKmh,
      pressure: weather.pressureHpa,
      slope: location.slopeDegrees,
      elevation: location.elevationMeters,
      soilSaturation: weather.soilSaturationPercent,
      historicalSusceptibility: location.historicalSusceptibility,
      terrainType: location.terrainType,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('/api/analyze-disaster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.success && data.analysis) {
        const ai = data.analysis;
        // Safely merge AI insights with our calibrated scoring model
        const merged: DisasterPredictionResult = {
          ...deterministicResult,
          isAiGenerated: true,
          overallRisk: {
            ...deterministicResult.overallRisk,
            confidence: ai.confidence ? Math.min(99, Math.max(70, Number(ai.confidence))) : deterministicResult.overallRisk.confidence,
          },
          whyExplanation: Array.isArray(ai.contributingFactors) && ai.contributingFactors.length >= 3
            ? ai.contributingFactors.slice(0, 5)
            : deterministicResult.whyExplanation,
          whatShouldYouDo: Array.isArray(ai.recommendations) && ai.recommendations.length >= 3
            ? ai.recommendations.slice(0, 6)
            : deterministicResult.whatShouldYouDo,
          landslideRisk: {
            ...deterministicResult.landslideRisk,
            explanation: ai.explanation || deterministicResult.landslideRisk.explanation,
            whyPoints: Array.isArray(ai.contributingFactors) && ai.contributingFactors.length >= 3
              ? ai.contributingFactors.slice(0, 5)
              : deterministicResult.landslideRisk.whyPoints,
            recommendedActions: Array.isArray(ai.recommendations) && ai.recommendations.length >= 3
              ? ai.recommendations.slice(0, 6)
              : deterministicResult.landslideRisk.recommendedActions,
          },
        };

        return {
          result: merged,
          isAiAssisted: true,
          providerMessage: 'Analyzed by Gemini AI Disaster Intelligence Engine',
        };
      }
    }
  } catch (err) {
    console.warn('AI analysis endpoint unavailable, using deterministic model:', err);
  }

  // Graceful fallback
  return {
    result: { ...deterministicResult, isAiGenerated: false },
    isAiAssisted: false,
    providerMessage: 'Deterministic Geospatial Fallback Engine Active',
  };
}
