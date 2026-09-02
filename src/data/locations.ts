export interface WeatherLocation {
  id: string;
  label: string;
  country: string;
  lat: number;
  lon: number;
}

export const WEATHER_LOCATIONS: WeatherLocation[] = [
  { id: "london", label: "London", country: "United Kingdom", lat: 51.5072, lon: -0.1276 },
  { id: "new-york", label: "New York", country: "United States", lat: 40.7128, lon: -74.006 },
  { id: "tokyo", label: "Tokyo", country: "Japan", lat: 35.6895, lon: 139.6917 },
  { id: "paris", label: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { id: "berlin", label: "Berlin", country: "Germany", lat: 52.52, lon: 13.405 },
  { id: "sydney", label: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { id: "los-angeles", label: "Los Angeles", country: "United States", lat: 34.0522, lon: -118.2437 },
  { id: "dubai", label: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708 },
  { id: "singapore", label: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
  { id: "mumbai", label: "Mumbai", country: "India", lat: 19.076, lon: 72.8777 },
  { id: "sao-paulo", label: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
  { id: "toronto", label: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832 },
  { id: "madrid", label: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038 },
  { id: "rome", label: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964 },
  { id: "istanbul", label: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784 },
  { id: "bangkok", label: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018 },
  { id: "seoul", label: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.978 },
  { id: "amsterdam", label: "Amsterdam", country: "Netherlands", lat: 52.3676, lon: 4.9041 },
  { id: "chicago", label: "Chicago", country: "United States", lat: 41.8781, lon: -87.6298 },
  { id: "hong-kong", label: "Hong Kong", country: "Hong Kong", lat: 22.3193, lon: 114.1694 },
];
