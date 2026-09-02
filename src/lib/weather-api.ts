/* oxlint-disable unicorn/max-nested-calls */
import { z } from "zod";

const OpenMeteoResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  current: z
    .object({
      time: z.string(),
      temperature_2m: z.number().nullable(),
      relative_humidity_2m: z.number().nullable().optional(),
      wind_speed_10m: z.number().nullable().optional(),
      weather_code: z.number().nullable().optional(),
    })
    .optional(),
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number().nullable()),
    temperature_2m_min: z.array(z.number().nullable()),
    precipitation_sum: z.array(z.number().nullable()),
    wind_speed_10m_max: z.array(z.number().nullable()),
  }),
  daily_units: z
    .object({
      temperature_2m_max: z.string().optional(),
      temperature_2m_min: z.string().optional(),
      precipitation_sum: z.string().optional(),
      wind_speed_10m_max: z.string().optional(),
    })
    .optional(),
});

export type OpenMeteoResponse = z.infer<typeof OpenMeteoResponseSchema>;

export interface DailyRow {
  date: string;
  max: number | null;
  min: number | null;
  precipitation: number | null;
  windMax: number | null;
}

export interface WeatherData {
  location: { lat: number; lon: number; timezone: string };
  current: {
    time: string;
    temperature: number | null;
    humidity: number | null;
    windSpeed: number | null;
    weatherCode: number | null;
  } | null;
  daily: DailyRow[];
  units: {
    temp: string;
    precipitation: string;
    wind: string;
  };
}

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code");
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Open-Meteo HTTP ${res.status}: ${res.statusText}`);
  }

  const json: unknown = await res.json();
  const parsed = OpenMeteoResponseSchema.parse(json);

  const daily: DailyRow[] = parsed.daily.time.map((date, i) => ({
    date,
    max: parsed.daily.temperature_2m_max[i] ?? null,
    min: parsed.daily.temperature_2m_min[i] ?? null,
    precipitation: parsed.daily.precipitation_sum[i] ?? null,
    windMax: parsed.daily.wind_speed_10m_max[i] ?? null,
  }));

  return {
    location: { lat: parsed.latitude, lon: parsed.longitude, timezone: parsed.timezone },
    current: parsed.current
      ? {
          time: parsed.current.time,
          temperature: parsed.current.temperature_2m,
          humidity: parsed.current.relative_humidity_2m ?? null,
          windSpeed: parsed.current.wind_speed_10m ?? null,
          weatherCode: parsed.current.weather_code ?? null,
        }
      : null,
    daily,
    units: {
      temp: parsed.daily_units?.temperature_2m_max ?? "°C",
      precipitation: parsed.daily_units?.precipitation_sum ?? "mm",
      wind: parsed.daily_units?.wind_speed_10m_max ?? "km/h",
    },
  };
};

export const formatWeatherCode = (code: number | null): string => {
  if (code === null || code === undefined) return "—";
  const map: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight showers",
    81: "Moderate showers",
    82: "Violent showers",
    95: "Thunderstorm",
    96: "Thunderstorm + hail",
  };
  return map[code] ?? `Code ${code}`;
};
