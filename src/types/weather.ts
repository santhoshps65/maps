export interface WeatherData {
  location: {
    city: string;
    region: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  current: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    precipitation: number;
    windSpeed: number;
  }>;
  lastUpdated: string;
}

export interface GeologicalData {
  location: {
    lat: number;
    lng: number;
    region: string;
  };
  soilMoisture: number;
  slopeAngle: number;
  recentRainfall: number;
  seismicActivity: number;
  terrainStability: number;
  lastUpdated: string;
}

export type AlertSeverity = 'Low' | 'Moderate' | 'High' | 'Critical';

export type AlertType = 
  | 'landslide'
  | 'flash_flood'
  | 'severe_thunderstorm'
  | 'temperature_extreme'
  | 'high_wind'
  | 'seismic_activity'
  | 'general_weather';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  location: {
    city: string;
    region: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  title: string;
  description: string;
  currentConditions: string;
  forecast: string;
  risks: string[];
  recommendations: string[];
  timestamp: string;
  expiresAt: string;
  dataSource: string;
  reliabilityScore: number;
  confidenceLevel: number;
}

export interface WeatherStation {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  lastUpdate: string;
  sensors: {
    temperature: boolean;
    humidity: boolean;
    pressure: boolean;
    wind: boolean;
    precipitation: boolean;
    seismic: boolean;
  };
}