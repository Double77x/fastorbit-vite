import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fetchWeather, formatWeatherCode } from "@/lib/weather-api";

const validResponse = {
  latitude: 51.5,
  longitude: -0.12,
  timezone: "Europe/London",
  current: {
    time: "2026-09-02T12:00",
    temperature_2m: 18.5,
    relative_humidity_2m: 65,
    wind_speed_10m: 12.3,
    weather_code: 3,
  },
  daily: {
    time: ["2026-09-02", "2026-09-03"],
    temperature_2m_max: [20.1, 21.5],
    temperature_2m_min: [12.3, 13],
    precipitation_sum: [0, 2.5],
    wind_speed_10m_max: [15, 18.2],
  },
  daily_units: {
    temperature_2m_max: "°C",
    precipitation_sum: "mm",
    wind_speed_10m_max: "km/h",
  },
};

describe("formatWeatherCode", () => {
  it("returns em dash for null", () => {
    expect(formatWeatherCode(null)).toBe("—");
  });

  it("maps known codes", () => {
    expect(formatWeatherCode(0)).toBe("Clear sky");
    expect(formatWeatherCode(3)).toBe("Overcast");
    expect(formatWeatherCode(95)).toBe("Thunderstorm");
  });

  it("falls back to Code N for unknown", () => {
    expect(formatWeatherCode(999)).toBe("Code 999");
  });
});

describe("fetchWeather", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    globalThis.fetch = originalFetch;
  });

  it("parses valid response into WeatherData", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(validResponse),
    } as Response);

    const data = await fetchWeather(51.5, -0.12);

    expect(data.location).toEqual({ lat: 51.5, lon: -0.12, timezone: "Europe/London" });
    expect(data.current).toEqual({
      time: "2026-09-02T12:00",
      temperature: 18.5,
      humidity: 65,
      windSpeed: 12.3,
      weatherCode: 3,
    });
    expect(data.daily).toHaveLength(2);
    expect(data.daily[0]).toEqual({
      date: "2026-09-02",
      max: 20.1,
      min: 12.3,
      precipitation: 0,
      windMax: 15,
    });
    expect(data.units).toEqual({ temp: "°C", precipitation: "mm", wind: "km/h" });

    const url = new URL(vi.mocked(fetch).mock.calls[0][0] as string);
    expect(url.searchParams.get("latitude")).toBe("51.5");
    expect(url.searchParams.get("longitude")).toBe("-0.12");
    expect(url.searchParams.get("forecast_days")).toBe("7");
  });

  it("falls back to defaults when daily_units missing", async () => {
    const minimal = {
      ...validResponse,
      daily_units: undefined,
      current: undefined,
    };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(minimal),
    } as Response);

    const data = await fetchWeather(0, 0);
    expect(data.current).toBeNull();
    expect(data.units).toEqual({ temp: "°C", precipitation: "mm", wind: "km/h" });
    expect(data.daily[0].max).toBe(20.1);
  });

  it("throws on http error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Server Error",
      json: () => Promise.resolve({}),
    } as Response);

    await expect(fetchWeather(0, 0)).rejects.toThrow("Open-Meteo HTTP 500");
  });

  it("throws on invalid schema", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve({ invalid: true }),
    } as Response);

    await expect(fetchWeather(0, 0)).rejects.toThrow();
  });

  it("handles nullable daily values as null", async () => {
    const withNulls = {
      ...validResponse,
      daily: {
        time: ["2026-09-02"],
        temperature_2m_max: [null],
        temperature_2m_min: [null],
        precipitation_sum: [null],
        wind_speed_10m_max: [null],
      },
    };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(withNulls),
    } as Response);

    const data = await fetchWeather(0, 0);
    expect(data.daily[0]).toEqual({
      date: "2026-09-02",
      max: null,
      min: null,
      precipitation: null,
      windMax: null,
    });
  });
});
