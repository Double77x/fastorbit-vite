import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchWeather, type WeatherData } from "@/lib/weather-api";
import type { WeatherLocation } from "@/data/locations";

export const weatherKeys = {
  all: ["weather"] as const,
  forecast: (locationId: string) => [...weatherKeys.all, locationId] as const,
};

interface UseWeatherOptions {
  enabled?: boolean;
}

export const useWeather = (location: WeatherLocation, options: UseWeatherOptions = {}) => {
  const isClient = globalThis.window !== undefined;
  return useQuery<WeatherData, Error>({
    queryKey: weatherKeys.forecast(location.id),
    queryFn: () => fetchWeather(location.lat, location.lon),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: isClient && (options.enabled ?? true),
    placeholderData: keepPreviousData,
  });
};
