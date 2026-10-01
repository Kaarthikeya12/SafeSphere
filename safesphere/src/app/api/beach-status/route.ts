import { NextResponse } from 'next/server';
import { GOA_BEACHES } from '@/data/goaBeaches';

// Real weather from open-meteo (free, no key needed)
// Marine data from open-meteo marine API
export async function GET() {
  try {
    // Goa center coordinates for general weather
    const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=15.49&longitude=73.82&current=temperature_2m,weather_code,wind_speed_10m,precipitation&hourly=temperature_2m&timezone=Asia%2FKolkata&forecast_days=1';

    // Marine API for wave data (Goa coast)
    const marineUrl = 'https://marine-api.open-meteo.com/v1/marine?latitude=15.49&longitude=73.7&current=wave_height,wave_direction,wave_period&timezone=Asia%2FKolkata';

    const [weatherResp, marineResp] = await Promise.allSettled([
      fetch(weatherUrl, { next: { revalidate: 1800 } }),
      fetch(marineUrl, { next: { revalidate: 1800 } })
    ]);

    let temperature = 29;
    let windSpeed = 18;
    let precipitation = 0;
    let waveHeight = 1.2;

    if (weatherResp.status === 'fulfilled' && weatherResp.value.ok) {
      const wdata = await weatherResp.value.json();
      temperature = Math.round(wdata.current?.temperature_2m ?? 29);
      windSpeed = Math.round(wdata.current?.wind_speed_10m ?? 18);
      precipitation = wdata.current?.precipitation ?? 0;
    }

    if (marineResp.status === 'fulfilled' && marineResp.value.ok) {
      const mdata = await marineResp.value.json();
      waveHeight = mdata.current?.wave_height ?? 1.2;
    }

    // Compute beach flag status based on wave height
    const beachStatuses = GOA_BEACHES.map(beach => {
      // Adjust wave height per beach using local multiplier
      const localWave = +(waveHeight * beach.typicalWaveHtM / 1.5).toFixed(2);
      const actualWave = Math.max(0.3, Math.min(4.5, localWave));

      let flag: 'green' | 'yellow' | 'red' = 'green';
      let swimmable = true;
      if (actualWave > 2.0 || beach.ripCurrentRisk === 'high') {
        flag = 'red';
        swimmable = false;
      } else if (actualWave > 1.2 || beach.ripCurrentRisk === 'medium') {
        flag = 'yellow';
        swimmable = beach.lifeguards;
      }

      // Override with beach base safety
      if (!beach.swimmingSafe && flag === 'green') {
        flag = 'yellow';
        swimmable = false;
      }

      return {
        id: beach.id,
        name: beach.name,
        lat: beach.lat,
        lng: beach.lng,
        taluka: beach.taluka,
        flag,
        waveHeightM: actualWave,
        swimmable,
        lifeguards: beach.lifeguards,
        ripCurrentRisk: beach.ripCurrentRisk,
        description: beach.description,
        nearestPolice: beach.nearestPolice,
        nearestHospital: beach.nearestHospital,
        knownHazards: beach.knownHazards
      };
    });

    // Determine overall sea condition
    let seaCondition: 'calm' | 'moderate' | 'rough' | 'very_rough' = 'calm';
    if (waveHeight > 3.0) seaCondition = 'very_rough';
    else if (waveHeight > 2.0) seaCondition = 'rough';
    else if (waveHeight > 1.0) seaCondition = 'moderate';

    return NextResponse.json({
      weather: {
        temperature,
        windSpeed,
        precipitation,
        description: precipitation > 5 ? 'Heavy Rain' : precipitation > 0 ? 'Light Rain' : windSpeed > 30 ? 'Windy' : 'Partly Cloudy',
        timestamp: new Date().toISOString(),
      },
      marine: {
        waveHeightM: +waveHeight.toFixed(2),
        seaCondition,
        swimmingAdvisory: waveHeight > 2.0 ? 'DO NOT SWIM — Dangerous sea conditions' : waveHeight > 1.0 ? 'CAUTION — Swim only near lifeguard zones' : 'Conditions acceptable — always follow flag warnings',
      },
      beaches: beachStatuses,
      source: 'open-meteo.com',
      cachedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error('Beach/weather API error:', err);
    // Return mock data so the UI doesn't break
    return NextResponse.json({
      weather: { temperature: 29, windSpeed: 22, precipitation: 4, description: 'Cloudy', timestamp: new Date().toISOString() },
      marine: { waveHeightM: 1.6, seaCondition: 'moderate', swimmingAdvisory: 'CAUTION — Follow flag warnings at all beaches' },
      beaches: GOA_BEACHES.map(b => ({
        ...b,
        flag: b.ripCurrentRisk === 'high' ? 'red' : b.ripCurrentRisk === 'medium' ? 'yellow' : 'green',
        waveHeightM: b.typicalWaveHtM,
        swimmable: b.swimmingSafe && b.ripCurrentRisk === 'low'
      })),
      source: 'mock-fallback',
      cachedAt: new Date().toISOString(),
    });
  }
}
