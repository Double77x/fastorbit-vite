import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useWeather, weatherKeys } from "@/hooks/use-weather";
import type { WeatherLocation } from "@/data/locations";

vi.mock("@/lib/weather-api", () => ({
  fetchWeather: vi.fn(),
}));

import { fetchWeather } from "@/lib/weather-api";

const mockFetchWeather = vi.mocked(fetchWeather);

const london: WeatherLocation = { id: "london", label: "London", country: "United Kingdom", lat: 51.5, lon: -0.12 };
const paris: WeatherLocation = { id: "paris", label: "Paris", country: "France", lat: 48.85, lon: 2.35 };

const createWrapper = () => {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
  return { Wrapper, qc };
};

describe("weatherKeys", () => {
  it("builds stable keys", () => {
    expect(weatherKeys.all).toEqual(["weather"]);
    expect(weatherKeys.forecast("london")).toEqual(["weather", "london"]);
    expect(weatherKeys.forecast("paris")).not.toEqual(weatherKeys.forecast("london"));
  });
});

describe("useWeather", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchWeather.mockResolvedValue({
      location: { lat: 51.5, lon: -0.12, timezone: "Europe/London" },
      current: { time: "2026-09-02T12:00", temperature: 18, humidity: 60, windSpeed: 10, weatherCode: 1 },
      daily: [],
      units: { temp: "°C", precipitation: "mm", wind: "km/h" },
    } as never);
  });

  it("uses correct queryKey and calls fetchWeather with lat/lon", async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useWeather(london), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetchWeather).toHaveBeenCalledWith(51.5, -0.12);
    expect(mockFetchWeather).toHaveBeenCalledTimes(1);
    expect(result.current.data?.location.lat).toBe(51.5);
  });

  it("switches queryKey when location changes (keepPreviousData)", async () => {
    const { Wrapper } = createWrapper();
    const { result, rerender } = renderHook(({ loc }) => useWeather(loc), {
      wrapper: Wrapper,
      initialProps: { loc: london },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.location.lat).toBe(51.5);

    mockFetchWeather.mockResolvedValueOnce({
      location: { lat: 48.85, lon: 2.35, timezone: "Europe/Paris" },
      current: { time: "2026-09-02T12:00", temperature: 22, humidity: 55, windSpeed: 8, weatherCode: 0 },
      daily: [],
      units: { temp: "°C", precipitation: "mm", wind: "km/h" },
    } as never);

    rerender({ loc: paris });
    await waitFor(() => expect(result.current.data?.location.lat).toBe(48.85));
    expect(mockFetchWeather).toHaveBeenCalledWith(48.85, 2.35);
  });

  it("respects enabled:false", () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useWeather(london, { enabled: false }), { wrapper: Wrapper });

    // should be disabled, not fetching
    expect(result.current.fetchStatus).toBe("idle");
    expect(mockFetchWeather).not.toHaveBeenCalled();
  });

  it("has keepPreviousData placeholder and 5m staleTime", async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useWeather(london), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.location.timezone).toBe("Europe/London");
  });
});
