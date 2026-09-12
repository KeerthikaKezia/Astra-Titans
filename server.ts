import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NER DisasterGuard API',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasWeatherKey: Boolean(process.env.WEATHER_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Weather API proxy endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const lat = req.query.lat ? Number(req.query.lat) : 25.5788;
    const lon = req.query.lon ? Number(req.query.lon) : 91.8933;

    // Optional WeatherAPI or OpenWeatherMap if key is provided
    const weatherKey = process.env.WEATHER_API_KEY;
    if (weatherKey) {
      try {
        const weatherApiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherKey}&q=${lat},${lon}&days=3&aqi=no&alerts=yes`;
        const weatherResp = await fetch(weatherApiUrl);
        if (weatherResp.ok) {
          const wData = await weatherResp.json();
          return res.json({
            isLive: true,
            dataSource: 'Live WeatherAPI Pro Service',
            raw: wData,
          });
        }
      } catch (weatherErr) {
        console.warn('External weather API failed, falling back to open meteorological data:', weatherErr);
      }
    }

    // Default open-meteo query
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,surface_pressure,wind_speed_10m&hourly=precipitation,temperature_2m,relative_humidity_2m&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata`;
    const meteoResp = await fetch(openMeteoUrl);
    if (meteoResp.ok) {
      const meteoData = await meteoResp.json();
      return res.json({
        isLive: true,
        dataSource: 'Live Meteorological Station Network (Open-Meteo)',
        raw: meteoData,
      });
    }

    res.json({ isLive: false, message: 'Live data unavailable, use demo mode' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Weather fetch error' });
  }
});

// AI Disaster Analysis Endpoint
app.post('/api/analyze-disaster', async (req, res) => {
  try {
    const data = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.status(200).json({
        success: false,
        message: 'Gemini API key not configured on server. Fallback deterministic model active.',
      });
    }

    const prompt = `
You are an expert geotechnical and disaster risk specialist for the North Eastern Region (NER) of India (Assam, Meghalaya, Arunachal Pradesh, Sikkim, Mizoram, Nagaland, Manipur, Tripura).
Analyze the following environmental and meteorological parameters for a location in NER and produce a structured disaster early warning evaluation:

Location: ${data.location}, District: ${data.district}, State: ${data.state}
Coordinates: Lat ${data.latitude}, Lon ${data.longitude}
Elevation: ${data.elevation} meters AMSL
Slope: ${data.slope} degrees (${data.terrainType})
Historical Landslide Susceptibility: ${data.historicalSusceptibility}
24-hour Rainfall: ${data.rainfallLast24h} mm (Last 1h: ${data.rainfallLast1h} mm, Last 6h: ${data.rainfallLast6h} mm)
Forecast Rainfall (next 24h): ${data.rainfallForecast24h} mm
Soil Saturation: ${data.soilSaturation}%
Temperature: ${data.temperature}°C, Humidity: ${data.humidity}%, Wind Speed: ${data.windSpeed} km/h, Barometric Pressure: ${data.pressure} hPa

Respond ONLY with a valid JSON object strictly matching this schema:
{
  "overallRisk": "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH" | "EXTREME",
  "landslideRisk": "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH" | "EXTREME",
  "floodRisk": "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH" | "EXTREME",
  "heavyRainfallRisk": "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH" | "EXTREME",
  "confidence": 85,
  "primaryHazard": "Landslide" | "Flash Flood" | "Riverine Flood" | "Heavy Rainfall",
  "explanation": "Concise 1-2 sentence overall hazard statement explaining the driving meteorological and geotechnical factors.",
  "contributingFactors": [
    "Factor 1 explaining specific rainfall or terrain driver",
    "Factor 2 explaining soil moisture or slope angle",
    "Factor 3 explaining runoff, forecast, or historical context",
    "Factor 4 explaining geological fragility"
  ],
  "recommendations": [
    "Direct actionable civil safety advice 1 for hill/valley residents",
    "Road/travel guideline 2 for steep corridors",
    "Precautionary action 3 regarding slopes or watercourses",
    "Emergency preparedness guidance 4"
  ]
}
`;

    let responseText = '{}';
    let modelUsed = 'gemini-3.8-flash';

    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const modelCandidate of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelCandidate,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        if (response && response.text) {
          responseText = response.text.trim();
          modelUsed = modelCandidate;
          break;
        }
      } catch (mErr: any) {
        lastError = mErr;
        console.warn(`Model ${modelCandidate} failed (${mErr.message || 'error'}), trying next candidate...`);
      }
    }

    if (!responseText || responseText === '{}') {
      throw lastError || new Error('No response from AI model candidates');
    }

    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch {
      // Clean up markdown fences if present
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      analysis = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      analysis,
      modelUsed,
    });
  } catch (err: any) {
    console.error('Gemini prediction error:', err);
    res.status(200).json({
      success: false,
      message: err.message || 'AI generation failed, fallback engine available',
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NER DisasterGuard server running on port ${PORT}`);
  });
}

startServer();
